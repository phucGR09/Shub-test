/* ================== CREATE NEW DATABASE ================== */
USE master;
IF DB_ID('fuel_mgmt') IS NOT NULL
BEGIN
    ALTER DATABASE fuel_mgmt SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE fuel_mgmt;
END;
CREATE DATABASE fuel_mgmt;
GO
USE fuel_mgmt;
GO

/* ====================== DROP TABLES (if re-run) ====================== */
IF OBJECT_ID('dbo.giao_dich','U') IS NOT NULL DROP TABLE dbo.giao_dich;
IF OBJECT_ID('dbo.tru_bom','U')   IS NOT NULL DROP TABLE dbo.tru_bom;
IF OBJECT_ID('dbo.hang_hoa','U')  IS NOT NULL DROP TABLE dbo.hang_hoa;
IF OBJECT_ID('dbo.tram_xang','U') IS NOT NULL DROP TABLE dbo.tram_xang;
GO

/* ======================= TABLES ============================= */
-- TRẠM XĂNG
CREATE TABLE dbo.tram_xang (
  station_id BIGINT IDENTITY(1,1) PRIMARY KEY,
  code       VARCHAR(20)   NOT NULL UNIQUE,
  name       NVARCHAR(255) NOT NULL,
  address    NVARCHAR(255) NULL,
  phone      VARCHAR(20)   NULL,
  created_at DATETIME2(0)  NOT NULL CONSTRAINT DF_tram_xang_created_at DEFAULT (SYSUTCDATETIME())
);
GO

-- HÀNG HÓA (A95, E5, DO, …)
CREATE TABLE dbo.hang_hoa (
  goods_id INT IDENTITY(1,1) PRIMARY KEY,
  code     VARCHAR(20)   NOT NULL UNIQUE,
  name     NVARCHAR(255) NOT NULL,
  unit     VARCHAR(10)   NOT NULL CONSTRAINT DF_hang_hoa_unit DEFAULT ('L'),
  active   BIT           NOT NULL CONSTRAINT DF_hang_hoa_active DEFAULT (1)
);
GO

-- TRỤ BƠM (mỗi trụ chỉ cấp 1 loại hàng hóa)
CREATE TABLE dbo.tru_bom (
  pump_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
  station_id  BIGINT NOT NULL,
  pump_no     INT    NOT NULL,      -- số/nhãn trụ tại trạm
  goods_id    INT    NOT NULL,
  installed_at DATE   NULL,

  CONSTRAINT UQ_tru_bom_station_pumpno UNIQUE (station_id, pump_no),
  CONSTRAINT UQ_tru_bom_pump_goods     UNIQUE (pump_id, goods_id),
  CONSTRAINT UQ_tru_bom_station_pump   UNIQUE (station_id, pump_id),

  CONSTRAINT FK_tru_bom_station FOREIGN KEY (station_id)
    REFERENCES dbo.tram_xang(station_id) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT FK_tru_bom_goods FOREIGN KEY (goods_id)
    REFERENCES dbo.hang_hoa(goods_id)    ON UPDATE CASCADE ON DELETE NO ACTION
);
GO

-- GIAO DỊCH
CREATE TABLE dbo.giao_dich (
  tx_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
  tx_time     DATETIME2(0) NOT NULL CONSTRAINT DF_gd_tx_time DEFAULT (SYSUTCDATETIME()),
  station_id  BIGINT NOT NULL,
  pump_id     BIGINT NOT NULL,
  goods_id    INT    NOT NULL,
  quantity    DECIMAL(12,3) NOT NULL,
  unit_price  DECIMAL(12,2) NOT NULL,

  -- tổng tiền = quantity * unit_price
  total_amount AS (ROUND(quantity * unit_price, 2)) PERSISTED,

  CONSTRAINT CK_gd_quantity CHECK (quantity > 0),
  CONSTRAINT CK_gd_price    CHECK (unit_price >= 0),

   -- Khóa ngoại: tất cả đều NO ACTION để tránh multi-cascade
  CONSTRAINT FK_gd_station FOREIGN KEY (station_id)
    REFERENCES dbo.tram_xang(station_id) ON UPDATE NO ACTION ON DELETE NO ACTION,

  CONSTRAINT FK_gd_goods FOREIGN KEY (goods_id)
    REFERENCES dbo.hang_hoa(goods_id)    ON UPDATE NO ACTION ON DELETE NO ACTION,

  -- Bảo đảm hàng hóa trong giao dịch đúng với hàng hóa của trụ
  CONSTRAINT FK_gd_pump_goods FOREIGN KEY (pump_id, goods_id)
    REFERENCES dbo.tru_bom(pump_id, goods_id) ON UPDATE NO ACTION ON DELETE NO ACTION,

  -- Bảo đảm trạm trong giao dịch đúng trạm sở hữu trụ
  CONSTRAINT FK_gd_station_pump FOREIGN KEY (station_id, pump_id)
    REFERENCES dbo.tru_bom(station_id, pump_id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
GO

/* ====================== INDEXES ======================= */
CREATE INDEX IX_gd_time     ON dbo.giao_dich (tx_time);
CREATE INDEX IX_gd_station  ON dbo.giao_dich (station_id, tx_time);
CREATE INDEX IX_gd_goods    ON dbo.giao_dich (goods_id, tx_time);
CREATE INDEX IX_gd_pump     ON dbo.giao_dich (pump_id, tx_time);
GO

/* ================== STORED PROCEDURES ================== */
-- 1) Lấy tất cả giao dịch của 1 trạm trong khoảng ngày
IF OBJECT_ID('dbo.sp_get_tx_by_station','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_get_tx_by_station;
GO
CREATE PROCEDURE dbo.sp_get_tx_by_station
    @p_station_id BIGINT,
    @p_from DATETIME2(0) = NULL,   -- nếu NULL: từ rất sớm
    @p_to   DATETIME2(0) = NULL    -- nếu NULL: tới rất muộn
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @v_from DATETIME2(0) = ISNULL(@p_from, '1970-01-01T00:00:00');
    DECLARE @v_to   DATETIME2(0) = ISNULL(@p_to,   '9999-12-31T23:59:59');

    DECLARE @v_to_exclusive DATETIME2(0) = DATEADD(SECOND, 1, @v_to);

    SELECT  gd.tx_id,
            gd.tx_time,
            s.code  AS station_code,
            pb.pump_no,
            hh.code AS goods_code,
            hh.name AS goods_name,
            gd.quantity,
            gd.unit_price,
            gd.total_amount
    FROM dbo.giao_dich AS gd
    JOIN dbo.tram_xang AS s ON s.station_id = gd.station_id
    JOIN dbo.tru_bom   AS pb ON pb.pump_id   = gd.pump_id
    JOIN dbo.hang_hoa  AS hh ON hh.goods_id  = gd.goods_id
    WHERE gd.station_id = @p_station_id
      AND gd.tx_time >= @v_from
      AND gd.tx_time <  @v_to_exclusive  
    ORDER BY gd.tx_time, gd.tx_id;        
END
GO


-- 2) Tổng doanh thu theo ngày cho 1 trụ bơm
IF OBJECT_ID('dbo.sp_daily_revenue_by_pump','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_daily_revenue_by_pump;
GO
CREATE PROCEDURE dbo.sp_daily_revenue_by_pump
  @p_station_id BIGINT,
  @p_pump_id    BIGINT,
  @p_date       DATE,
  @o_revenue    DECIMAL(14,2) OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @from DATETIME2(0) = @p_date;                 -- 00:00:00
  DECLARE @to   DATETIME2(0) = DATEADD(DAY, 1, @from);  -- [@from, @to)

  SELECT
    @o_revenue = COALESCE(SUM(gd.total_amount), 0)
  FROM dbo.giao_dich AS gd
  WHERE gd.station_id = @p_station_id
    AND gd.pump_id    = @p_pump_id
    AND gd.tx_time   >= @from
    AND gd.tx_time   <  @to;
END
GO

-- 3) Tổng doanh thu theo ngày cho 1 trạm
CREATE OR ALTER PROCEDURE dbo.sp_daily_revenue_by_station
  @p_station_id BIGINT,
  @p_date       DATE,
  @o_revenue    DECIMAL(14,2) OUTPUT   
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @from DATETIME2(0) = @p_date;
  DECLARE @to   DATETIME2(0) = DATEADD(DAY, 1, @from);  -- nửa mở [@from, @to)

  SELECT
    @o_revenue = COALESCE(SUM(gd.total_amount), 0)
  FROM dbo.giao_dich AS gd
  WHERE gd.station_id = @p_station_id
    AND gd.tx_time  >= @from
    AND gd.tx_time  <  @to;
END
GO

-- 4) Top 3 hàng hóa bán chạy nhất (tính theo lít) và doanh thu trong 1 tháng tại 1 trạm
IF OBJECT_ID('dbo.sp_top3_goods_by_station_month','P') IS NOT NULL
  DROP PROCEDURE dbo.sp_top3_goods_by_station_month;
GO
CREATE PROCEDURE dbo.sp_top3_goods_by_station_month
    @p_station_id BIGINT,
    @p_year  INT,
    @p_month TINYINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra tham số đơn giản
    IF @p_month NOT BETWEEN 1 AND 12 OR @p_year < 1900
    BEGIN
        RAISERROR('Invalid year or month.', 16, 1);
        RETURN;
    END;

    DECLARE @v_start DATE = DATEFROMPARTS(@p_year, @p_month, 1);
    DECLARE @v_end   DATE = DATEADD(MONTH, 1, @v_start);   -- [@v_start, @v_end)

    SELECT TOP (3)   
           gd.goods_id,
           hh.code,
           hh.name,
           SUM(gd.quantity)       AS total_liters,
           SUM(gd.total_amount)   AS revenue
    FROM dbo.giao_dich AS gd
    JOIN dbo.hang_hoa  AS hh ON hh.goods_id = gd.goods_id
    WHERE gd.station_id = @p_station_id
      AND gd.tx_time  >= @v_start
      AND gd.tx_time  <  @v_end
    GROUP BY gd.goods_id, hh.code, hh.name
    ORDER BY total_liters DESC, revenue DESC, gd.goods_id;
END
GO
/* =================== TVP cho danh mục & cấu hình ====================== */
IF OBJECT_ID('dbo.sp_ingest_tx_batch','P') IS NOT NULL DROP PROCEDURE dbo.sp_ingest_tx_batch;
IF OBJECT_ID('dbo.sp_upsert_tram_xang','P') IS NOT NULL DROP PROCEDURE dbo.sp_upsert_tram_xang;
IF OBJECT_ID('dbo.sp_upsert_hang_hoa','P')  IS NOT NULL DROP PROCEDURE dbo.sp_upsert_hang_hoa;
IF OBJECT_ID('dbo.sp_insert_tru_bom','P')   IS NOT NULL DROP PROCEDURE dbo.sp_insert_tru_bom;
IF TYPE_ID('dbo.TT_GiaoDich') IS NOT NULL DROP TYPE dbo.TT_GiaoDich;
IF TYPE_ID('dbo.TT_TramXang') IS NOT NULL DROP TYPE dbo.TT_TramXang;
IF TYPE_ID('dbo.TT_HangHoa')  IS NOT NULL DROP TYPE dbo.TT_HangHoa;
IF TYPE_ID('dbo.TT_TruBom')   IS NOT NULL DROP TYPE dbo.TT_TruBom;
GO


/* ---------- 1) TRẠM XĂNG: upsert theo code ---------- */
CREATE TYPE dbo.TT_TramXang AS TABLE
(
  code     VARCHAR(20)   NOT NULL,     -- khóa nghiệp vụ
  name     NVARCHAR(255) NOT NULL,
  address  NVARCHAR(255) NULL,
  phone    VARCHAR(20)   NULL
);
GO

CREATE PROCEDURE dbo.sp_upsert_tram_xang
  @rows dbo.TT_TramXang READONLY
AS
BEGIN
  SET NOCOUNT ON;

  -- Update các trạm đã tồn tại (match theo code)
  UPDATE tx
     SET tx.name    = r.name,
         tx.address = r.address,
         tx.phone   = r.phone
  FROM dbo.tram_xang AS tx
  JOIN @rows AS r
    ON r.code = tx.code;

  -- Insert các trạm chưa có
  INSERT INTO dbo.tram_xang(code, name, address, phone)
  SELECT r.code, r.name, r.address, r.phone
  FROM @rows AS r
  WHERE NOT EXISTS (
    SELECT 1 FROM dbo.tram_xang tx WHERE tx.code = r.code
  );
END
GO

/* ---------- 2) HÀNG HÓA: upsert theo code ---------- */
CREATE TYPE dbo.TT_HangHoa AS TABLE
(
  code   VARCHAR(20)   NOT NULL,       -- khóa nghiệp vụ
  name   NVARCHAR(255) NOT NULL,
  unit   VARCHAR(10)   NULL,           -- NULL => dùng default 'L'
  active BIT           NULL            -- NULL => giữ nguyên/1 khi insert
);
GO

CREATE PROCEDURE dbo.sp_upsert_hang_hoa
  @rows dbo.TT_HangHoa READONLY
AS
BEGIN
  SET NOCOUNT ON;

  -- Update theo code (giữ nguyên nếu giá trị đầu vào NULL)
  UPDATE hh
     SET hh.name   = r.name,
         hh.unit   = COALESCE(r.unit,   hh.unit),
         hh.active = COALESCE(r.active, hh.active)
  FROM dbo.hang_hoa AS hh
  JOIN @rows AS r
    ON r.code = hh.code;

  -- Insert mới (áp dụng default nếu NULL)
  INSERT INTO dbo.hang_hoa(code, name, unit, active)
  SELECT r.code,
         r.name,
         COALESCE(r.unit,   'L'),
         COALESCE(r.active, 1)
  FROM @rows AS r
  WHERE NOT EXISTS (
    SELECT 1 FROM dbo.hang_hoa hh WHERE hh.code = r.code
  );
END
GO

/* ---------- 3) TRỤ BƠM: insert theo station_code + pump_no + goods_code ---------- */
/* 
    - Mỗi trụ (pump_no trong 1 station) chỉ gán 1 goods ngay từ đầu.
    - Không cập nhật đổi goods cho trụ đã tồn tại vì có ràng buộc FK tổng hợp ở giao_dich.
*/
CREATE TYPE dbo.TT_TruBom AS TABLE
(
  station_code VARCHAR(20) NOT NULL,
  pump_no      INT         NOT NULL,
  goods_code   VARCHAR(20) NOT NULL,
  installed_at DATE        NULL
);
GO

CREATE PROCEDURE dbo.sp_insert_tru_bom
  @rows dbo.TT_TruBom READONLY
AS
BEGIN
  SET NOCOUNT ON;

  /* Chỉ INSERT các (station_id, pump_no) chưa tồn tại.
     Map station_code -> station_id; goods_code -> goods_id.
  */
  INSERT INTO dbo.tru_bom (station_id, pump_no, goods_id, installed_at)
  SELECT s.station_id,
         r.pump_no,
         h.goods_id,
         r.installed_at
  FROM @rows AS r
  JOIN dbo.tram_xang AS s
    ON s.code = r.station_code
  JOIN dbo.hang_hoa  AS h
    ON h.code = r.goods_code
  WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.tru_bom pb
    WHERE pb.station_id = s.station_id
      AND pb.pump_no    = r.pump_no
  );
END
GO

/* ---------- 4) GIAO DỊCH: upsert theo code ---------- */
CREATE TYPE dbo.TT_GiaoDich AS TABLE
(
  station_code VARCHAR(20)   NOT NULL,               -- mã trạm (tram_xang.code)
  pump_no      INT           NOT NULL,               -- số trụ trong trạm
  tx_time      DATETIME2(0)  NOT NULL,               -- thời điểm giao dịch (UTC)
  quantity     DECIMAL(12,3) NOT NULL CHECK (quantity > 0),
  unit_price   DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0)
);
GO

-- 2) Proc nhận TVP và đổ vào bảng giao_dich (set-based, 1 round-trip)
CREATE PROCEDURE dbo.sp_ingest_tx_batch
  @rows dbo.TT_GiaoDich READONLY
AS
BEGIN
  SET NOCOUNT ON;

  /*  Map theo station_code + pump_no để:
      - Tự lấy station_id/pump_id/goods_id chính xác từ tru_bom
      - Luôn thỏa các FK tổng hợp của bảng giao_dich
  */
  INSERT INTO dbo.giao_dich (tx_time, station_id, pump_id, goods_id, quantity, unit_price)
  SELECT r.tx_time, pb.station_id, pb.pump_id, pb.goods_id, r.quantity, r.unit_price
  FROM @rows AS r
  JOIN dbo.tram_xang AS s
    ON s.code = r.station_code
  JOIN dbo.tru_bom AS pb
    ON pb.station_id = s.station_id
   AND pb.pump_no    = r.pump_no;
END
GO
/* ====================== UPSERT=======================*/
-- 1) Upsert trạm
DECLARE @stations dbo.TT_TramXang;
INSERT INTO @stations VALUES
('S01', N'Trạm Quận 1', N'123 Lê Lợi, Q1', '0909000001'),
('S02', N'Trạm Quận 7', N'88 Nguyễn Văn Linh, Q7', '0909000002');
EXEC dbo.sp_upsert_tram_xang @rows = @stations;

-- 2) Upsert hàng hóa
DECLARE @goods dbo.TT_HangHoa;
INSERT INTO @goods (code, name, unit, active) VALUES
('A95', N'Xăng A95', 'L', 1),
('E5',  N'Xăng E5',  'L', 1),
('DO',  N'Dầu DO',  'L', 1);
EXEC dbo.sp_upsert_hang_hoa @rows = @goods;

-- 3) Insert trụ bơm (map theo station_code + pump_no + goods_code)
DECLARE @pumps dbo.TT_TruBom;
INSERT INTO @pumps VALUES
('S01', 1, 'A95', '2024-01-01'),
('S01', 2, 'E5',  '2024-01-02'),
('S02', 1, 'DO',  '2024-02-01');
EXEC dbo.sp_insert_tru_bom @rows = @pumps;

-- 4) Ingest giao dịch theo lô (TVP)
DECLARE @tx dbo.TT_GiaoDich;
INSERT INTO @tx VALUES
('S01', 1, '2025-08-25 09:30:00', 25.5, 23500),
('S01', 2, '2025-08-25 10:05:00', 18.2, 22000),
('S02', 1, '2025-08-25 11:10:00', 30.0, 24000);
EXEC dbo.sp_ingest_tx_batch @rows = @tx;

/* ====================== EXAMPLES ========================*/

-- 1)
EXEC dbo.sp_get_tx_by_station
     @p_station_id = 1,
     @p_from = '2025-08-25 00:00:00',
     @p_to   = '2025-08-26 23:59:59';

-- 2)
DECLARE @rev DECIMAL(14,2);

EXEC dbo.sp_daily_revenue_by_pump
     @p_station_id = 1,
     @p_pump_id    = 1,
     @p_date       = '2025-08-25',
     @o_revenue    = @rev OUTPUT;

SELECT @rev AS revenue;

-- 3)
DECLARE @rev2 DECIMAL(14,2);
EXEC dbo.sp_daily_revenue_by_station
     @p_station_id = 1,
     @p_date       = '2025-08-25',
     @o_revenue    = @rev2 OUTPUT;

SELECT @rev2 AS revenue;

-- 4)
EXEC dbo.sp_top3_goods_by_station_month
     @p_station_id = 1,
     @p_year  = 2025,
     @p_month = 8;
