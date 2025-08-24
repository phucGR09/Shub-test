# ArrayAlgorithmSolver

## Mô tả

Đây là chương trình Python dùng để lấy dữ liệu từ API, xác thực bằng Bearer Token, giải quyết các bài toán về mảng và gửi kết quả về lại API.

- **Xác thực:** Token được lấy từ API khi gọi GET, sau đó tự động thêm vào header cho các request tiếp theo.
- **Bài toán mảng:**
  - Type 1: Tính tổng các phần tử trong đoạn [l, r].
  - Type 2: Tính hiệu giữa tổng các phần tử vị trí chẵn và tổng các phần tử vị trí lẻ trong đoạn [l, r].

## Cấu trúc file

- `task4.py`: Chứa toàn bộ code xử lý.
- `requirement.txt`: Danh sách các thư viện cần cài đặt (ví dụ: requests).

## Hướng dẫn chạy

1. **Cài đặt thư viện**
   Mở terminal tại thư mục dự án và chạy:

   ```cmd
   pip install -r requirement.txt
   ```

2. **Chạy chương trình**

   ```cmd
   python task4.py
   ```

3. **Kết quả**
   - Chương trình sẽ tự động lấy dữ liệu từ API, nhận token, xử lý bài toán và gửi kết quả về API.
   - Kết quả sẽ được in ra màn hình và xác nhận gửi thành công.

## Code report

### Dùng ngôn ngữ python, REST API bằng thư viện requests

### Ý tưởng:
* Bài toán yêu cầu độ phức tạp O(q + n) => Hướng tới tiền xử lý mảng trong O(n) và truy vấn trong O(1).
* Tạo mảng tổng prefix, tổng chẵn prefix, tổng lẻ prefix với prefix[i] = arr[0] + ... + arr[i-1].
* Mỗi truy vấn (l, r), tính tổng theo tính chất mảng cộng tiền tố. Ta có:
  * type 1: sum = prefix[r + 1] - prefix[l]
  * type 2: diff = (even_prefix[r + 1] - even_prefix[l]) - (odd_prefix[r + 1] - odd_prefix[l]) 
