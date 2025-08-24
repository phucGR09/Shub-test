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

/* ================== DROP TABLES (if re-run) ================== */
IF OBJECT_ID('dbo.giao_dich','U') IS NOT NULL DROP TABLE dbo.giao_dich;
IF OBJECT_ID('dbo.tru_bom','U')   IS NOT NULL DROP TABLE dbo.tru_bom;
IF OBJECT_ID('dbo.hang_hoa','U')  IS NOT NULL DROP TABLE dbo.hang_hoa;
IF OBJECT_ID('dbo.tram_xang','U') IS NOT NULL DROP TABLE dbo.tram_xang;
GO

/* ================== TABLES ================== */
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

/* ================== INDEXES ================== */
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

/* ================== EXAMPLES ================== */

-- 1)
EXEC dbo.sp_get_tx_by_station
     @p_station_id = 1,
     @p_from = '2024-03-21 00:00:00',
     @p_to   = '2024-03-23 23:59:59';

-- 2)
DECLARE @rev DECIMAL(14,2);

EXEC dbo.sp_daily_revenue_by_pump
     @p_station_id = 1,
     @p_pump_id    = 1,
     @p_date       = '2025-08-24',
     @o_revenue    = @rev OUTPUT;

SELECT @rev AS revenue;

-- 3)
DECLARE @rev2 DECIMAL(14,2);
EXEC dbo.sp_daily_revenue_by_station
     @p_station_id = 12,
     @p_date       = '2024-03-21',
     @o_revenue    = @rev2 OUTPUT;

SELECT @rev2 AS revenue;

-- 4)
EXEC dbo.sp_top3_goods_by_station_month
     @p_station_id = 1,
     @p_year  = 2024,
     @p_month = 3;
