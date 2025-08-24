import requests
import json
from typing import List, Any

class ArrayAlgorithmSolver:
    # Khởi tạo solver với URL gốc của API và Bearer Token
    def __init__(self, base_url: str, token: str = None):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = token
        if token:
            self.session.headers.update({"Authorization": f"Bearer {token}"})

    # Cập nhật Bearer Token cho session
    def set_token(self, token: str):
        self.token = token
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    # Lấy dữ liệu từ API
    def get_data(self, endpoint: str) -> dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Lỗi khi lấy dữ liệu: {e}")
            return None
    # Gửi kết quả về API
    def post_result(self, endpoint: str, result: Any) -> bool:
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {'Content-Type': 'application/json'}
            response = self.session.post(url, json={"result": result}, headers=headers)
            response.raise_for_status()
            print("Gửi kết quả thành công!")
            return True
        except requests.exceptions.RequestException as e:
            print(f"Lỗi khi gửi kết quả: {e}")
            return False

    # Giải quyết bài toán mảng
    def solve_array_problem(self, array: List[int], queries: List[dict]) -> Any:
        """
        type 1: tính tổng đoạn (l, r)
        type 2: tính hiệu giữa tổng các phần tử vị trí chẵn
        và tổng các phần tử vị trí lẻ trong đoạn (l, r)
        
        """
        n = len(array)
        result = []
        prefix_sum = [0] * (n + 1)
        even_prefix_sum = [0] * (n + 1)
        odd_prefix_sum = [0] * (n + 1)

        # Tính tổng prefix
        for i in range(n):
            prefix_sum[i + 1] = prefix_sum[i] + array[i]
            even_prefix_sum[i + 1] = even_prefix_sum[i]
            odd_prefix_sum[i + 1] = odd_prefix_sum[i]
            if i % 2 == 0:
                even_prefix_sum[i + 1] += array[i]
            else:
                odd_prefix_sum[i + 1] += array[i]

        for query in queries:
            l, r = query["range"]
            if query["type"] == '1':
                # Tổng đoạn [l, r]
                total = prefix_sum[r + 1] - prefix_sum[l]
                result.append(total)
            elif query["type"] == '2':
                # Hiệu tổng chẵn - tổng lẻ trong đoạn [l, r]
                even_total = even_prefix_sum[r + 1] - even_prefix_sum[l]
                odd_total = odd_prefix_sum[r + 1] - odd_prefix_sum[l]
                diff = even_total - odd_total
                result.append(diff)
            else:
                result.append(None)

        return result

    # Chạy toàn bộ quy trình: lấy dữ liệu -> giải quyết -> gửi kết quả
    def run(self, data_endpoint: str, result_endpoint: str):

        # Lấy dữ liệu từ API
        data = self.get_data(data_endpoint)

        if data is None:
            print("Không thể lấy dữ liệu!")
            return

        # Lấy token từ dữ liệu trả về
        token = data.get("token")
        if token:
            self.set_token(token)
            print(f"Đã nhận token: {token}")

        # Lấy mảng data và query
        array = data.get("data", [])
        queries = data.get("query", [])

        # Chuyển query về dạng list các dict
        query_list = []
        for q in queries:
            query_list.append({
                "type": q.get("type"),
                "range": q.get("range")
            })

        # Giải quyết bài toán
        result = self.solve_array_problem(array, query_list)
        print(f"Kết quả: {result}")

        # Gửi kết quả về API
        self.post_result(result_endpoint, result)


# Sử dụng
if __name__ == "__main__":
    BASE_URL = "https://share.shub.edu.vn/api/intern-test"
    DATA_ENDPOINT = "input"
    RESULT_ENDPOINT = "output"


    solver = ArrayAlgorithmSolver(BASE_URL)
    solver.run(DATA_ENDPOINT, RESULT_ENDPOINT)