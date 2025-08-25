# CSDL Quản Lý Trạm Xăng (SQL Server)

### Giải thích các mối liên kết

- **Trạm (1) ──< Trụ (N)** — "Trạm quản lý trụ bơm"

  - Lý do: mỗi trụ thuộc một trạm; mỗi trạm có nhiều trụ. (FK tru_bom.station_id)

- **Hàng (1) ──< Trụ (N)** — "Trụ phân phối hàng hóa"

  - Lý do: trụ chỉ bơm 1 loại hàng; một loại hàng có thể gán cho nhiều trụ. (FK tru_bom.goods_id; UQ (pump_id, goods_id))

- **Trụ (1) ──< Giao dịch (N)** — "Giao dịch phát sinh tại trụ"

  - Lý do: mọi giao dịch gắn với một trụ cụ thể. (FK tổng hợp bảo toàn trạm & hàng của trụ)

- **Trạm (1) ──< Giao dịch (N)** — "Giao dịch diễn ra tại trạm"

  - Lý do: hỗ trợ lọc/báo cáo nhanh theo trạm; đồng nhất với trụ nhờ FK tổng hợp.

- **Hàng (1) ──< Giao dịch (N)** — "Giao dịch bán loại hàng"
  - Lý do: thống kê theo hàng; đồng nhất với trụ nhờ FK tổng hợp.xăng: danh mục trạm, hàng hóa, cấu hình trụ bơm (mỗi trụ chỉ bơm 1 loại hàng), và ghi nhận giao dịch (thời điểm, trạm, trụ, hàng hóa, số lít, đơn giá, tổng tiền). Kèm các thủ tục báo cáo nhanh.

### Ngôn ngữ

SQL Server / T-SQL. Thời gian lưu UTC (SYSUTCDATETIME()).

### Thành phần chính

#### Bảng

- **tram_xang** — trạm xăng. PK: station_id; UK: code.
- **hang_hoa** — hàng hóa (A95/E5/DO…). PK: goods_id; UK: code; unit mặc định 'L'; active mặc định 1.
- **tru_bom** — trụ bơm tại trạm. PK: pump_id; UQ: (station_id, pump_no), (pump_id, goods_id), (station_id, pump_id).
- **giao_dich** — giao dịch bán. PK: tx_id; cột tính PERSISTED total_amount = ROUND(quantity\*unit_price,2); CHECK: quantity > 0, unit_price >= 0.

#### Khóa ngoại (FK)

- tru_bom.station_id → tram_xang.station_id
- tru_bom.goods_id → hang_hoa.goods_id
- giao_dich.station_id → tram_xang.station_id
- giao_dich.goods_id → hang_hoa.goods_id

**FK tổng hợp trong giao_dich:**

- (pump_id, goods_id) → tru_bom(pump_id, goods_id) (đúng loại hàng của trụ)
- (station_id, pump_id) → tru_bom(station_id, pump_id) (đúng trạm sở hữu trụ)

Các FK ở giao_dich dùng NO ACTION để tránh multiple cascade paths và giữ lịch sử.

#### Index

giao_dich(tx_time), (station_id, tx_time), (goods_id, tx_time), (pump_id, tx_time) — tăng tốc lọc/nhóm theo thời gian, trạm, hàng, trụ.

#### TVP (Table-Valued Parameter) — nhập liệu nhanh theo lô:

TT_TramXang, TT_HangHoa, TT_TruBom, TT_GiaoDich.

#### Procedures

**Ingest/Upsert:**

- sp_upsert_tram_xang(@rows TT_TramXang) — upsert trạm theo code.
- sp_upsert_hang_hoa(@rows TT_HangHoa) — upsert hàng hóa theo code.
- sp_insert_tru_bom(@rows TT_TruBom) — chèn trụ mới theo station_code + pump_no + goods_code.
- sp_ingest_tx_batch(@rows TT_GiaoDich) — nạp giao dịch theo lô; tự map ID từ station_code + pump_no.

**Báo cáo:**

- sp_get_tx_by_station — liệt kê giao dịch theo trạm + khoảng ngày (cửa sổ thời gian nửa mở).
- sp_daily_revenue_by_pump — OUTPUT doanh thu 1 ngày cho trụ tại trạm.
- sp_daily_revenue_by_station — OUTPUT doanh thu 1 ngày cho trạm.
- sp_top3_goods_by_station_month — top 3 hàng theo lít + doanh thu của tháng tại trạm.

### Cách chạy

**SSMS:** mở file SQL → Execute. Script tự tạo mới DB fuel_mgmt, bảng, index, TVP, procedures, và có phần EXAMPLES để thử nhanh.

**sqlcmd:**

```bash
sqlcmd -S . -d master -E -i fuel_mgmt.sql
```

**Thứ tự nhập liệu (khuyến nghị):** tram_xang → hang_hoa → tru_bom → giao_dich
(đã có TVP/proc mẫu cho cả 4 bước).

## 2. ERD

### Mô tả chung

Mô hình 4 thực thể: Trạm xăng (station) — Trụ bơm (pump) — Hàng hóa (goods) — Giao dịch (transaction).
Luồng nghiệp vụ: Trạm quản lý nhiều trụ; trụ chỉ phân phối một loại hàng; giao dịch phát sinh tại trụ (do đó thuộc trạm và bán đúng hàng của trụ).

Giải thích các mối liên kết

Trạm (1) ──< Trụ (N) — “Trạm quản lý trụ bơm”
Lý do: mỗi trụ thuộc một trạm; mỗi trạm có nhiều trụ. (FK tru_bom.station_id)

Hàng (1) ──< Trụ (N) — “Trụ phân phối hàng hóa”
Lý do: trụ chỉ bơm 1 loại hàng; một loại hàng có thể gán cho nhiều trụ. (FK tru_bom.goods_id; UQ (pump_id, goods_id))

Trụ (1) ──< Giao dịch (N) — “Giao dịch phát sinh tại trụ”
Lý do: mọi giao dịch gắn với một trụ cụ thể. (FK tổng hợp bảo toàn trạm & hàng của trụ)

Trạm (1) ──< Giao dịch (N) — “Giao dịch diễn ra tại trạm”
Lý do: hỗ trợ lọc/báo cáo nhanh theo trạm; đồng nhất với trụ nhờ FK tổng hợp.

Hàng (1) ──< Giao dịch (N) — “Giao dịch bán loại hàng”
Lý do: thống kê theo hàng; đồng nhất với trụ nhờ FK tổng hợp.

Tất cả ràng buộc đảm bảo: không thể ghi giao dịch sai trạm hoặc sai loại hàng so với cấu hình của trụ; đồng thời tối ưu truy vấn theo thời gian/trạm/trụ/hàng bằng index phù hợp.
