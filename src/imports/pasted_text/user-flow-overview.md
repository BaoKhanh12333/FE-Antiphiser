🗺️ TỔNG QUAN USER FLOW (SƠ ĐỒ NHÁNH)
Plaintext
[Màn hình Đăng nhập] ──(JWT Auth Check Role & Subscription)──► [Trang Tổng quan Dashboard]
                                                                      │
      ┌───────────────────────────────────────────────────────────────┘
      ▼
[Trang Chiến dịch được giao (Lộ trình học)] 
      │
      ├─► (Nếu Gói Free/Individual đã hết hạn mức) ──► [Pop-up Bảng giá / Paywall]
      │
      └─► (Nếu Hợp lệ) ──► Bấm [Vào thực hành]
                                │
                                ▼
                  [Màn hình Hộp thư mô phỏng] ◄──┐
                                │                │ (Lặp lại cho đến 
                                ├─► Di chuột     │  khi hết 10 email)
                                │   check link   │
                                │                │
                                ▼                │
                  [Bấm nút: Safe / Phishing]     │
                                │                │
                                ▼                │
                  [Bảng AI Feedback xuất hiện] ──┘
                                │
                                ▼ (Hoàn thành chiến dịch)
                  [Cập nhật Risk Score & Lưu Lịch sử]
📑 CHI TIẾT TỪNG BƯỚC TRONG FLOW (Kèm Logic Backend/Frontend)
Bước 1: Đăng nhập & Điều hướng (Login & Routing)

Hành động: User nhập tài khoản, bấm nút [Đăng nhập].  
DOCX

Logic hệ thống: Backend trả về JWT Token chứa thông tin Role: User và gói dịch vụ đang active (Free/Individual/Enterprise). Giao diện Next.js tự động chuyển User vào trang Tổng quan (Dashboard).  
DOCX
+ 1

Bước 2: Trang Tổng quan Dashboard (Overview)
Trải nghiệm: User thấy bức tranh tổng thể về năng lực của mình:

Điểm rủi ro hiện tại (Personal Risk Score: Ví dụ 83/100).  
DOCX

Biểu đồ AI Analytics Hub nhận xét nhanh về điểm yếu (Ví dụ: "Bạn hay dính bẫy Urgency Tactics" hoặc "Hay bỏ sót Fake Domains").  
DOCX
+ 3


Hành động: User bấm vào tab "Lộ trình học" (Nên đổi tên thành "Chiến dịch được giao") trên Sidebar để xem bài tập.  
DOCX
+ 2

Bước 3: Chọn Chiến dịch thực hành (Campaign Hub)

Trải nghiệm: User thấy danh sách các Campaign do Manager giao (Ví dụ: Basic Banking Phishing Awareness).  
DOCX
+ 2

Logic chặn gói (Paywall Check): * Nếu User dùng gói Free và đã làm hết 1 campaign duy nhất, hoặc gói Individual đã làm quá 2 campaign/tháng → Hệ thống làm mờ nút, hiển thị icon ổ khóa, bấm vào sẽ bật Pop-up Bảng giá (Pricing Strategy) để yêu cầu nâng cấp.

Nếu tài khoản thuộc gói Enterprise/Pro (Do doanh nghiệp trả tiền) hoặc gói cá nhân còn lượt → Nút [Vào thực hành] sáng lên. User bấm nút để bắt đầu.

Bước 4: Không gian mô phỏng Hộp thư (Simulation Workspace)
Trải nghiệm: Giao diện biến thành một Hộp thư điện tử (giống giao diện Vietcombank bạn đã vẽ). Hệ thống tải xuống 10 email trộn lẫn giữa email thật và email phishing.  
DOCX

Hành động tương tác (Kỹ năng Cybersecurity):

User đọc nội dung email, kiểm tra địa chỉ người gửi lừa đảo (Spoofed Sender).

User di chuột (Hover) vào các nút bấm/đường link trong email → Hệ thống hiển thị một tooltip nhỏ show URL thật phía sau để User check link giả mạo (Suspicious Links / Fake Domains).  
DOCX
+ 1

Bước 5: Ra quyết định & Trả lời (Submit Decision)
Hành động: Sau khi phân tích, User bắt buộc phải bấm vào 1 trong 2 nút công cụ trên Action Bar:

Nút [🟢 Xác nhận An toàn (Safe)].  
DOCX
+ 1

Nút [🔴 Báo cáo lừa đảo (Report Phishing)].  
DOCX
+ 1

Bước 6: Nhận phản hồi tức thì từ AI (AI Feedback Hub)

Trải nghiệm: Ngay khi User bấm nút xong, một bảng AI Feedback Panel từ bên phải trượt ra (hoặc hiển thị đè lên mail):  
DOCX
+ 1


Nếu Chọn Đúng: Hệ thống hiện thông báo chúc mừng, AI (OpenAI API) phân tích các dấu hiệu lừa đảo trong mail để User ghi nhớ.  
DOCX
+ 1


Nếu Chọn Sai (Dính bẫy): Hệ thống cảnh báo nguy hiểm, trên nội dung email tự động highlight đỏ vào các lỗi như Tên miền giả mạo hoặc Nội dung thúc ép thời gian. AI đưa ra lời khuyên cải thiện trực tiếp cho lỗi sai đó.  
DOCX
+ 3


Hành động: User bấm [Email tiếp theo] để lặp lại quy trình cho đến khi hoàn thành đủ 10 email của chiến dịch.  
DOCX
+ 1

Bước 7: Kết thúc chiến dịch & Đồng bộ dữ liệu (Analytics & Tracking)
Logic hệ thống: Khi làm xong email thứ 10, hệ thống tự động:

Chạy hàm Rule-based scoring để tính lại điểm, cập nhật lại Personal Risk Score mới của User lên Dashboard.  
DOCX

Đẩy dữ liệu lịch sử làm bài, các dạng phishing bị fail về Database PostgreSQL.  
DOCX
+ 1

Đồng bộ kết quả lên trang của Manager để sếp/quản lý có thể theo dõi tiến độ và biết nhân viên của mình đang yếu ở kỹ thuật nào.  
DOCX
+ 1


Màn hình hiển thị: Chuyển User quay trở lại trang Tổng quan Dashboard với các chỉ số số liệu mới đã được cập nhật.  
DOCX

💡 GỢI Ý THỂ HIỆN TRÊN FIGMA PROTOTYPE
Để chạy Demo mượt mà trong buổi báo cáo, bạn chỉ cần nối dây liên kết (Interaction) theo đúng thứ tự:

Nút [Đăng nhập] (Màn Login) → Smart Animate → Trang Dashboard Tổng quan.

Tab [Lộ trình học] (Sidebar) → On Click → Trang Danh sách Chiến dịch.

Nút [Xem lại / Vào thực hành] → On Click → Trang Hòm thư mô phỏng Vietcombank.


Nút [🔴 Báo cáo Phishing] (Bạn tự vẽ thêm trên hòm thư) → Open Overlay → Bật ra Khung AI Feedback Panel bên phải màn hình.  
DOCX
+ 1