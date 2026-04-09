import type { TopicBlueprint } from './types';

export const topicSetA: TopicBlueprint[] = [
  {
    id: 'topic-1',
    code: 'CD1',
    name: 'Giới thiệu chung về kỳ thi. Quy định chung trong lựa chọn nhà thầu',
    shortDescription: 'Định hình cách ôn thi và nắm các nguyên tắc nền của pháp luật đấu thầu.',
    learningObjectives: [
      'Hiểu cấu trúc đề thi và kỹ năng xử lý ngân hàng câu hỏi.',
      'Nắm khung pháp lý, phạm vi điều chỉnh và đối tượng áp dụng.',
      'Phân biệt tư cách hợp lệ, cạnh tranh, hành vi bị cấm và trách nhiệm các bên.',
    ],
    summary:
      'Chuyên đề mở đầu đặt nền cho toàn bộ chương trình. Học viên cần học theo nhóm nội dung và luôn gắn quy định với chủ thể, phạm vi và trách nhiệm.',
    flashSummary: [
      'Đọc đề theo nhóm: kỳ thi, khung pháp lý, tư cách hợp lệ và trách nhiệm.',
      'Ưu tiên nhớ các nguyên tắc nền như cạnh tranh, công khai, minh bạch.',
      'Dữ liệu mẫu chỉ dùng minh họa, cần rà soát chuyên môn trước khi dùng chính thức.',
    ],
    tags: ['kỳ thi', 'khung pháp lý', 'tư cách hợp lệ', 'trách nhiệm'],
    order: 1,
    lessons: [
      {
        idSuffix: 'exam-skills',
        title: 'Những điều cần lưu ý về kỳ thi và kỹ năng làm bài',
        content:
          '## Trọng tâm\nKỳ thi yêu cầu nhận diện nhanh nhóm câu hỏi, giới hạn thời gian và chọn đáp án phù hợp nhất.\n\n- Chia đề thành cụm nội dung.\n- Gắn đề cương với ngân hàng câu hỏi.\n- Dùng kỹ thuật loại trừ khi đáp án nhiễu.\n\n## Cách học\nSau mỗi buổi luyện, cần chốt lỗi sai theo chủ đề để tăng phản xạ làm bài.',
        keyPoints: [
          'Chia đề thi thành nhóm câu hỏi để ưu tiên phần chắc điểm trước.',
          'Đọc kỹ từ khóa về chủ thể, phạm vi và thời điểm hiệu lực.',
          'Kết hợp đề cương ôn tập với luyện câu hỏi để tạo phản xạ.',
        ],
        quickNotes: [
          'Ưu tiên câu chắc chắn trước rồi quay lại câu khó.',
          'Tạo checklist lỗi sai phổ biến sau mỗi đề luyện.',
          'Luôn xem giải thích để hiểu vì sao đáp án còn lại không phù hợp.',
        ],
        example:
          'Ví dụ: Gạch chân từ khóa về hành vi bị cấm, chủ thể và hình thức lựa chọn trước khi đọc đáp án.',
        references: ['Đề cương ôn tập chính thức', 'Placeholder: quy chế thi cập nhật'],
        estimatedStudyTime: 18,
      },
      {
        idSuffix: 'legal-framework',
        title: 'Khung pháp lý, phạm vi điều chỉnh và đối tượng áp dụng',
        content:
          '## Khung pháp lý\nNgười học cần nhìn pháp luật đấu thầu như một hệ thống gồm luật, nghị định hướng dẫn và quy định chuyên ngành.\n\n## Lưu ý\nMuốn chọn đúng quy định áp dụng phải đọc rõ nguồn vốn, chủ thể và loại gói thầu.',
        keyPoints: [
          'Khung pháp lý cần được đọc theo thứ bậc văn bản và phạm vi điều chỉnh.',
          'Muốn chọn đúng quy định phải xác định rõ nguồn vốn, chủ thể và loại gói thầu.',
          'Đối tượng áp dụng có thể thay đổi theo bối cảnh nên phải đọc kỹ dữ kiện đề bài.',
        ],
        quickNotes: [
          'Không suy diễn phạm vi áp dụng nếu đề chưa nêu đủ dữ kiện.',
          'Ghi nhớ mối liên hệ giữa luật chung và quy định chuyên ngành.',
          'Đáp án đúng thường mô tả đúng phạm vi áp dụng chứ không chỉ lặp lại từ khóa.',
        ],
        example:
          'Ví dụ: Cùng là mua sắm nhưng quy định áp dụng có thể khác nếu gói thầu thuộc lĩnh vực y tế.',
        references: ['Placeholder: luật và nghị định hiện hành', 'Placeholder: tài liệu chuyên ngành'],
        estimatedStudyTime: 22,
      },
      {
        idSuffix: 'competition-responsibility',
        title: 'Tư cách hợp lệ, bảo đảm cạnh tranh, hành vi bị cấm và trách nhiệm',
        content:
          '## Cốt lõi\nĐây là nhóm câu hỏi thường ra ở dạng tình huống. Hãy học theo cặp đối chiếu: hợp lệ - không hợp lệ, hành vi bị cấm - hậu quả xử lý.\n\n## Mẹo nhớ\nGắn từng trách nhiệm với đúng giai đoạn lựa chọn nhà thầu.',
        keyPoints: [
          'Tư cách hợp lệ của nhà thầu phải được xem xét theo điều kiện pháp lý và hồ sơ tham dự.',
          'Bảo đảm cạnh tranh đòi hỏi tính độc lập, minh bạch và không xung đột lợi ích.',
          'Hành vi bị cấm cần được ghi nhớ cùng cơ chế xử lý vi phạm và trách nhiệm liên quan.',
        ],
        quickNotes: [
          'Đề bài đổi chủ thể là dấu hiệu để kiểm tra điều kiện cạnh tranh.',
          'Nếu đáp án mô tả quan hệ phụ thuộc lợi ích thì cần xem lại nguyên tắc độc lập.',
          'Hãy gắn trách nhiệm của từng bên với đúng giai đoạn lựa chọn nhà thầu.',
        ],
        example:
          'Ví dụ: Đề bài có thể hỏi liệu quan hệ giữa đơn vị tư vấn và nhà thầu có làm mất tính cạnh tranh hay không.',
        references: ['Placeholder: quy định về cạnh tranh', 'Placeholder: tài liệu nội bộ về hành vi bị cấm'],
        estimatedStudyTime: 24,
      },
    ],
  },
  {
    id: 'topic-2',
    code: 'CD2',
    name: 'Kế hoạch tổng thể và kế hoạch lựa chọn nhà thầu',
    shortDescription: 'Tập trung vào nguyên tắc lập kế hoạch, thẩm định và bài tập thực hành.',
    learningObjectives: [
      'Nắm các nguyên tắc lập kế hoạch tổng thể và kế hoạch lựa chọn nhà thầu.',
      'Biết cách kiểm tra logic của hồ sơ kế hoạch trước khi trình thẩm định.',
      'Rèn kỹ năng giải bài tập kế hoạch bằng checklist.',
    ],
    summary:
      'Kế hoạch là bản đồ điều phối toàn bộ quá trình lựa chọn nhà thầu. Sai ở bước lập kế hoạch thường kéo theo sai ở nhiều bước phía sau.',
    flashSummary: [
      'Kế hoạch tốt phải bám nhu cầu, tiến độ, nguồn vốn và hình thức lựa chọn phù hợp.',
      'Thẩm định là kiểm tra cả biểu mẫu lẫn logic nghiệp vụ.',
      'Bài tập nên làm theo trình tự: dữ kiện, lỗi sai, căn cứ và điều chỉnh.',
    ],
    tags: ['kế hoạch', 'thẩm định', 'phê duyệt', 'bài tập'],
    order: 2,
    lessons: [
      {
        idSuffix: 'planning-principles',
        title: 'Nguyên tắc lập kế hoạch',
        content:
          '## Tư duy lập kế hoạch\nKế hoạch phải phản ánh nhu cầu thực tế, nguồn vốn và tiến độ triển khai.\n\n- Bám mục tiêu đầu tư hoặc mua sắm.\n- Bảo đảm đồng bộ với nguồn vốn.\n- Tránh chia nhỏ hoặc gom gói thiếu căn cứ.',
        keyPoints: [
          'Lập kế hoạch phải gắn với nhu cầu thực tế, phạm vi công việc và tiến độ.',
          'Nguồn vốn và khả năng bố trí vốn là căn cứ quan trọng của kế hoạch.',
          'Cấu trúc gói thầu cần hợp lý để tránh chia tách hoặc gom gói thiếu cơ sở.',
        ],
        quickNotes: [
          'Hãy soi kế hoạch bằng câu hỏi: có phù hợp nhu cầu và tiến độ không.',
          'Một kế hoạch logic phải liên kết mục tiêu với hình thức lựa chọn.',
          'Đừng bỏ qua yếu tố khả thi khi đề bài nói đến nguồn vốn.',
        ],
        example: 'Ví dụ: Tiến độ rất gấp nhưng hình thức lựa chọn không tương thích là dấu hiệu có vấn đề.',
        references: ['Placeholder: nguyên tắc lập kế hoạch', 'Biểu mẫu kế hoạch mẫu'],
        estimatedStudyTime: 18,
      },
      {
        idSuffix: 'appraisal-approval',
        title: 'Kỹ năng lập, thẩm định và phê duyệt kế hoạch',
        content:
          '## Từ soạn thảo đến phê duyệt\nKế hoạch tốt không chỉ đủ trường thông tin mà còn phải có căn cứ, nhất quán và dễ thẩm định.\n\n## Checklist\nĐối chiếu mục tiêu, hình thức lựa chọn, tiến độ, thẩm quyền và căn cứ pháp lý.',
        keyPoints: [
          'Thẩm định kế hoạch cần kiểm tra căn cứ, logic và tính thống nhất của thông tin.',
          'Phê duyệt chỉ có ý nghĩa khi nội dung đã được rà soát về thẩm quyền và sự phù hợp.',
          'Người lập kế hoạch phải trình bày được cơ sở của hình thức và phương thức lựa chọn.',
        ],
        quickNotes: [
          'Đọc chéo giữa tên gói thầu, phạm vi công việc và hình thức lựa chọn.',
          'Nếu căn cứ pháp lý không khớp với nội dung thì kế hoạch dễ bị chỉnh sửa.',
          'Sai thẩm quyền phê duyệt là lỗi nhỏ trên giấy nhưng lớn về pháp lý.',
        ],
        example: 'Ví dụ: Một biểu mẫu ghi thời gian lựa chọn trước bước chuẩn bị đầu tư là tín hiệu không logic.',
        references: ['Placeholder: hướng dẫn thẩm định', 'Checklist rà soát nội bộ'],
        estimatedStudyTime: 22,
      },
      {
        idSuffix: 'planning-exercises',
        title: 'Bài tập và checklist thực hành về kế hoạch',
        content:
          '## Cách làm bài tập\nTóm tắt dữ kiện đầu vào trước, phát hiện lỗi logic sau và cuối cùng mới đề xuất chỉnh sửa.\n\n## Mẹo\nDùng mẫu suy nghĩ: phát hiện lỗi -> nêu căn cứ -> đề xuất chỉnh.',
        keyPoints: [
          'Bài tập kế hoạch nên được giải bằng cách xác định dữ kiện đầu vào và lỗi logic trước.',
          'Checklist giúp giảm sai sót khi rà soát hình thức, thời gian và thẩm quyền.',
          'Đề xuất điều chỉnh phải dựa trên nguyên tắc lập kế hoạch chứ không chỉ cảm tính.',
        ],
        quickNotes: [
          'Tóm tắt dữ kiện đề bài bằng ba dòng trước khi chọn đáp án.',
          'Nếu có nhiều sai sót, hãy ưu tiên lỗi ảnh hưởng trực tiếp đến tính hợp lệ.',
          'Ghi nhớ mẫu suy nghĩ: phát hiện lỗi, nêu căn cứ, đề xuất chỉnh sửa.',
        ],
        example: 'Ví dụ: Với bài tập chia gói chưa hợp lý, cần chỉ ra dấu hiệu bất hợp lý trước khi đề xuất phương án.',
        references: ['Checklist ôn tập nội bộ', 'Placeholder: bài tập tình huống'],
        estimatedStudyTime: 18,
      },
    ],
  },
  {
    id: 'topic-3',
    code: 'CD3',
    name: 'Quy trình, thủ tục lựa chọn nhà thầu',
    shortDescription: 'Bao quát các hình thức lựa chọn nhà thầu và điều kiện áp dụng.',
    learningObjectives: [
      'Phân biệt điều kiện áp dụng của từng hình thức lựa chọn nhà thầu.',
      'Nắm trình tự cơ bản của các quy trình cạnh tranh, trực tiếp và đặc biệt.',
      'Biết đối chiếu tình huống đề bài với đúng thủ tục phù hợp.',
    ],
    summary:
      'Đây là chuyên đề trọng tâm, dễ nhầm nhất. Cách học hiệu quả là gom các hình thức thành nhóm để so sánh điều kiện áp dụng và trình tự thực hiện.',
    flashSummary: [
      'Nhóm cạnh tranh rộng: đấu thầu rộng rãi, hạn chế, chào hàng cạnh tranh.',
      'Nhóm điều kiện đặc thù: chỉ định thầu, mua sắm trực tiếp, tự thực hiện, trường hợp đặc biệt.',
      'Nhóm điện tử và trực tuyến cần lưu ý thao tác quy trình và thời gian trên hệ thống.',
    ],
    tags: ['quy trình', 'thủ tục', 'hình thức lựa chọn', 'điều kiện'],
    order: 3,
    lessons: [
      {
        idSuffix: 'competitive',
        title: 'Đấu thầu rộng rãi, hạn chế và chào hàng cạnh tranh',
        content:
          '## Nhóm thủ tục cạnh tranh\nBa hình thức này đều dựa trên cạnh tranh nhưng khác nhau về phạm vi mời thầu, điều kiện áp dụng và mức độ đơn giản hóa thủ tục.\n\n## Mẹo nhớ\nSo sánh theo bốn trục: phạm vi mời thầu, mức độ cạnh tranh, hồ sơ yêu cầu và tiêu chí đánh giá.',
        keyPoints: [
          'Đấu thầu rộng rãi là hình thức cạnh tranh phổ biến với phạm vi mời thầu rộng.',
          'Đấu thầu hạn chế phù hợp khi cần giới hạn số lượng nhà thầu đáp ứng yêu cầu đặc thù.',
          'Chào hàng cạnh tranh gắn với quy trình đơn giản hơn trong phạm vi điều kiện cho phép.',
        ],
        quickNotes: [
          'So sánh hình thức bằng tiêu chí phạm vi mời thầu và mức độ cạnh tranh.',
          'Đề bài nêu yêu cầu kỹ thuật đặc thù thường là tín hiệu xem lại hình thức hạn chế.',
          'Nếu quy trình được mô tả ngắn gọn, hãy kiểm tra khả năng chào hàng cạnh tranh.',
        ],
        example: 'Ví dụ: Câu hỏi có thể yêu cầu chọn hình thức phù hợp khi cần cạnh tranh rộng nhưng không có yếu tố kỹ thuật đặc biệt.',
        references: ['Placeholder: quy định về ba hình thức cạnh tranh', 'Bảng so sánh hình thức nội bộ'],
        estimatedStudyTime: 22,
      },
      {
        idSuffix: 'direct-special',
        title: 'Chỉ định thầu, mua sắm trực tiếp, tự thực hiện và trường hợp đặc biệt',
        content:
          '## Nhóm thủ tục có điều kiện\nĐây không phải lựa chọn mặc định. Hãy học theo mô hình điều kiện - lý do - rủi ro để tránh chọn sai trong câu hỏi tình huống.',
        keyPoints: [
          'Chỉ định thầu chỉ được cân nhắc khi đáp ứng đầy đủ điều kiện áp dụng theo tình huống cụ thể.',
          'Mua sắm trực tiếp phải được hiểu là sự nối tiếp có điều kiện chứ không phải rút gọn tùy ý.',
          'Tự thực hiện và trường hợp đặc biệt cần gắn với năng lực, tính phù hợp và căn cứ pháp lý rõ ràng.',
        ],
        quickNotes: [
          'Thấy đề bài dùng chữ khẩn cấp chưa đủ để kết luận ngay về chỉ định thầu.',
          'Đừng bỏ qua yêu cầu kiểm tra tính tương đồng khi gặp mua sắm trực tiếp.',
          'Trường hợp đặc biệt luôn cần đọc kỹ căn cứ pháp lý đi kèm.',
        ],
        example: 'Ví dụ: Một đơn vị có sẵn năng lực chưa chắc đã đủ điều kiện để chọn hình thức tự thực hiện.',
        references: ['Placeholder: điều kiện áp dụng', 'Placeholder: hướng dẫn trường hợp đặc biệt'],
        estimatedStudyTime: 24,
      },
      {
        idSuffix: 'specialized-online',
        title: 'Tư vấn cá nhân, đàm phán giá, chào giá trực tuyến và mua sắm trực tuyến',
        content:
          '## Nhóm chuyên biệt và trực tuyến\nNhóm này dễ gây nhầm vì vừa có yếu tố quy trình, vừa có yếu tố môi trường điện tử hoặc đặc thù đối tượng.\n\n## Khi làm bài\nXem đề nhấn mạnh vào đối tượng nào, môi trường thực hiện nào và yêu cầu minh bạch nào.',
        keyPoints: [
          'Lựa chọn tư vấn cá nhân cần bám đặc thù nhân sự và yêu cầu năng lực cá nhân.',
          'Đàm phán giá gắn với điều kiện áp dụng và mục tiêu tối ưu giá trong khuôn khổ cho phép.',
          'Chào giá trực tuyến và mua sắm trực tuyến đòi hỏi thao tác đúng quy trình trên môi trường điện tử.',
        ],
        quickNotes: [
          'Nếu đề nói rõ vai trò của cá nhân chuyên gia, hãy kiểm tra hướng tư vấn cá nhân.',
          'Không đồng nhất đàm phán giá với mọi trường hợp cần giảm giá.',
          'Quy trình trực tuyến luôn cần chú ý thời điểm, thông tin đăng tải và minh bạch trên hệ thống.',
        ],
        example: 'Ví dụ: Câu hỏi có thể yêu cầu phân biệt mua sắm trực tuyến với chào giá trực tuyến.',
        references: ['Placeholder: tư vấn cá nhân và đàm phán giá', 'Placeholder: quy trình trực tuyến'],
        estimatedStudyTime: 20,
      },
    ],
  },
];
