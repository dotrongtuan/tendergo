import type { TopicBlueprint } from './types';

export const topicSetC: TopicBlueprint[] = [
  {
    id: 'topic-7',
    code: 'CD7',
    name: 'Hợp đồng',
    shortDescription: 'Bao quát loại hợp đồng, điều kiện ký kết, thực hiện và thanh lý.',
    learningObjectives: [
      'Phân biệt các loại hợp đồng thường gặp trong đấu thầu.',
      'Nắm điều kiện ký kết, nguyên tắc thực hiện và sửa đổi hợp đồng.',
      'Hiểu thanh toán, thanh lý và đánh giá uy tín nhà thầu.',
    ],
    summary:
      'Chuyên đề hợp đồng yêu cầu tư duy theo vòng đời: ký kết, thực hiện, điều chỉnh, thanh toán và kết thúc. Đây là chuyên đề có nhiều câu hỏi tình huống.',
    flashSummary: [
      'Loại hợp đồng phù hợp quyết định cách quản trị rủi ro trong thực hiện.',
      'Mọi sửa đổi và điều chỉnh giá đều cần đặt trong nguyên tắc đã được cho phép.',
      'Thanh toán, thanh lý và uy tín nhà thầu là phần cuối nhưng rất hay ra tình huống.',
    ],
    tags: ['hợp đồng', 'thanh toán', 'điều chỉnh giá', 'uy tín nhà thầu'],
    order: 7,
    lessons: [
      {
        idSuffix: 'types-signing',
        title: 'Các loại hợp đồng và điều kiện ký kết',
        content:
          '## Loại hợp đồng\nMỗi loại hợp đồng phản ánh một cách phân chia rủi ro và trách nhiệm khác nhau giữa các bên.\n\n## Điều kiện ký kết\nHãy gắn điều kiện ký kết với kết quả lựa chọn, hồ sơ và thẩm quyền.',
        keyPoints: [
          'Loại hợp đồng cần được lựa chọn phù hợp với tính chất công việc và mức độ ổn định của phạm vi.',
          'Điều kiện ký kết hợp đồng phải gắn với kết quả lựa chọn nhà thầu và hồ sơ liên quan.',
          'Không nên xem loại hợp đồng chỉ là nhãn gọi tên mà phải hiểu cả hệ quả quản lý đi kèm.',
        ],
        quickNotes: [
          'Nếu phạm vi công việc có biến động lớn, hãy cân nhắc lại loại hợp đồng được nêu.',
          'Đề bài nhắc đến ký kết nhưng thiếu điều kiện nền thường là bẫy câu hỏi.',
          'Hãy gắn điều kiện ký kết với đúng thời điểm sau lựa chọn nhà thầu.',
        ],
        example: 'Ví dụ: Câu hỏi có thể yêu cầu chọn loại hợp đồng phù hợp với công việc có phạm vi rõ ràng và ít biến động.',
        references: ['Placeholder: quy định về các loại hợp đồng', 'Placeholder: điều kiện ký kết hợp đồng'],
        estimatedStudyTime: 20,
      },
      {
        idSuffix: 'implementation-amendment',
        title: 'Nguyên tắc thực hiện, sửa đổi hợp đồng và điều chỉnh giá',
        content:
          '## Giai đoạn thực hiện\nKhi hợp đồng đã ký, trọng tâm chuyển sang quản trị phạm vi, tiến độ, chất lượng và xử lý thay đổi phát sinh.\n\n## Điều chỉnh\nSửa đổi hợp đồng và điều chỉnh giá chỉ nên được hiểu trong phạm vi nguyên tắc và căn cứ cho phép.',
        keyPoints: [
          'Nguyên tắc thực hiện hợp đồng yêu cầu bám phạm vi, tiến độ và chất lượng đã cam kết.',
          'Sửa đổi hợp đồng phải có căn cứ và không làm lệch bản chất của kết quả lựa chọn ban đầu.',
          'Điều chỉnh giá hợp đồng cần được xem xét cùng điều kiện áp dụng và cơ chế quản lý rủi ro.',
        ],
        quickNotes: [
          'Không phải phát sinh nào cũng đủ căn cứ để sửa đổi hợp đồng.',
          'Khi đề nhắc đến điều chỉnh giá, cần kiểm tra điều kiện và phạm vi trước khi chọn đáp án.',
          'Hãy ghi nhớ nguyên tắc: thay đổi có kiểm soát, có căn cứ và có trách nhiệm quản lý.',
        ],
        example: 'Ví dụ: Một yêu cầu tăng giá không tự động hợp lệ nếu thiếu căn cứ và không phù hợp với loại hợp đồng đã ký.',
        references: ['Placeholder: nguyên tắc thực hiện hợp đồng', 'Tài liệu nội bộ về điều chỉnh giá'],
        estimatedStudyTime: 22,
      },
      {
        idSuffix: 'payment-liquidation',
        title: 'Thanh toán, thanh lý hợp đồng và uy tín nhà thầu',
        content:
          '## Cuối vòng đời hợp đồng\nThanh toán và thanh lý là giai đoạn tổng hợp kết quả thực hiện, còn đánh giá uy tín nhà thầu là đầu vào cho hoạt động sau này.\n\n## Khi làm bài\nHãy liên hệ giữa thực hiện hợp đồng thực tế với việc ghi nhận kết quả và đánh giá chất lượng.',
        keyPoints: [
          'Thanh toán hợp đồng phải gắn với khối lượng, chất lượng và hồ sơ chứng từ phù hợp.',
          'Thanh lý hợp đồng là bước kết thúc quan trọng để xác nhận quyền và nghĩa vụ đã hoàn thành.',
          'Uy tín nhà thầu và chất lượng hàng hóa đã sử dụng tạo dữ liệu đầu vào cho các quyết định tiếp theo.',
        ],
        quickNotes: [
          'Không nhầm thanh toán với thanh lý, vì mục tiêu quản lý của hai bước là khác nhau.',
          'Đề bài có thể gài bằng cách trộn lẫn chứng từ thanh toán và thủ tục kết thúc hợp đồng.',
          'Đánh giá uy tín nhà thầu nên được đọc như một công cụ quản trị dữ liệu.',
        ],
        example: 'Ví dụ: Nhà thầu hoàn thành đúng tiến độ nhưng chất lượng phát sinh vấn đề vẫn có thể bị đánh giá chưa tốt.',
        references: ['Placeholder: quy định về thanh toán và thanh lý', 'Placeholder: cơ chế đánh giá uy tín'],
        estimatedStudyTime: 20,
      },
    ],
  },
  {
    id: 'topic-8',
    code: 'CD8',
    name: 'Xử lý tình huống trong đấu thầu',
    shortDescription: 'Làm rõ nguyên tắc và cách tiếp cận khi phát sinh tình huống.',
    learningObjectives: [
      'Hiểu bản chất của xử lý tình huống trong đấu thầu.',
      'Nắm nguyên tắc xử lý và thẩm quyền xem xét tình huống.',
      'Rèn tư duy giải quyết tình huống theo hướng đúng thẩm quyền và có căn cứ.',
    ],
    summary:
      'Chuyên đề này giúp học viên tránh phản xạ xử lý cảm tính. Khi gặp tình huống, cần quay về nguyên tắc, thẩm quyền và mục tiêu bảo đảm hiệu quả, cạnh tranh, minh bạch.',
    flashSummary: [
      'Không xử lý tình huống bằng suy diễn ngoài nguyên tắc.',
      'Cần xác định đúng thẩm quyền và căn cứ trước khi đề xuất phương án.',
      'Đề thi thường kiểm tra lựa chọn phương án ít rủi ro pháp lý hơn.',
    ],
    tags: ['xử lý tình huống', 'nguyên tắc', 'thẩm quyền', 'rủi ro pháp lý'],
    order: 8,
    lessons: [
      {
        idSuffix: 'framework',
        title: 'Các quy định về xử lý tình huống trong đấu thầu',
        content:
          '## Bản chất tình huống\nTình huống phát sinh khi thực tiễn xuất hiện vấn đề chưa được quy định rõ hoặc cần lựa chọn cách hiểu phù hợp nhất.\n\n## Cách học\nLuôn hỏi: vấn đề nằm ở đâu, đã có quy định trực tiếp chưa, và nguyên tắc nào cần ưu tiên.',
        keyPoints: [
          'Xử lý tình huống phải bắt đầu từ việc xác định đúng bản chất vấn đề phát sinh.',
          'Không phải mọi khó khăn trong thực hiện đều được xem là tình huống cần xử lý đặc biệt.',
          'Căn cứ xử lý tình huống phải quay về quy định và mục tiêu của hoạt động lựa chọn nhà thầu.',
        ],
        quickNotes: [
          'Đề càng mô tả mơ hồ càng phải quay về nguyên tắc cơ bản.',
          'Đừng chọn đáp án chỉ vì có vẻ linh hoạt nếu thiếu căn cứ pháp lý.',
          'Trước khi quyết định phương án, hãy xác định rõ tình huống thuộc giai đoạn nào.',
        ],
        example: 'Ví dụ: Một điểm chưa rõ trong hồ sơ chưa chắc đã là tình huống đặc biệt nếu vẫn xử lý được theo quy trình thông thường.',
        references: ['Placeholder: quy định về xử lý tình huống', 'Bộ câu hỏi tình huống minh họa'],
        estimatedStudyTime: 18,
      },
      {
        idSuffix: 'principles-authority',
        title: 'Nguyên tắc xử lý tình huống và thẩm quyền xem xét',
        content:
          '## Nguyên tắc\nPhương án xử lý phải giữ được tính cạnh tranh, minh bạch, hiệu quả và đúng thẩm quyền.\n\n## Thẩm quyền\nPhương án đúng về kỹ thuật nhưng sai thẩm quyền vẫn là phương án không phù hợp.',
        keyPoints: [
          'Nguyên tắc xử lý tình huống là giữ đúng mục tiêu của hoạt động đấu thầu và giảm rủi ro pháp lý.',
          'Thẩm quyền xem xét xử lý tình huống phải được xác định trước khi thực hiện bất kỳ phương án nào.',
          'Phương án hợp lý thường là phương án cân bằng giữa hiệu quả thực tế và tính đúng quy định.',
        ],
        quickNotes: [
          'Đề nói đến xử lý linh hoạt nhưng không nói thẩm quyền là dấu hiệu bẫy.',
          'Hãy ưu tiên phương án bảo vệ cạnh tranh và minh bạch.',
          'Đừng nhầm phương án tiện lợi nhất với phương án đúng nhất.',
        ],
        example: 'Ví dụ: Một đơn vị phát hiện sai lệch dữ liệu nhưng không có thẩm quyền tự quyết toàn bộ hướng xử lý.',
        references: ['Placeholder: nguyên tắc xử lý tình huống', 'Tài liệu tóm tắt thẩm quyền xử lý'],
        estimatedStudyTime: 20,
      },
      {
        idSuffix: 'case-method',
        title: 'Tình huống điển hình và phương án tiếp cận',
        content:
          '## Học qua tình huống\nLuyện các tình huống điển hình để tạo khung suy nghĩ khi gặp câu hỏi mới.\n\n- Nhận diện tình huống.\n- Xác định căn cứ và thẩm quyền.\n- Đánh giá phương án ít rủi ro nhất.',
        keyPoints: [
          'Tình huống điển hình nên được phân tích theo cấu trúc nhận diện vấn đề, căn cứ và phương án.',
          'Phương án xử lý tốt phải hạn chế tranh chấp và giữ được tính minh bạch của quy trình.',
          'Luyện tình huống giúp học viên chuyển lý thuyết thành phản xạ ra quyết định.',
        ],
        quickNotes: [
          'Dùng sơ đồ ba bước để tránh sa đà vào chi tiết vụ việc.',
          'Nếu hai đáp án đều có vẻ hợp lý, hãy chọn đáp án ít rủi ro pháp lý hơn.',
          'Gắn từng tình huống với bài học rút ra để nhớ lâu hơn.',
        ],
        example: 'Ví dụ: Khi hai nguồn dữ liệu hồ sơ không thống nhất, câu hỏi thường muốn kiểm tra cách tiếp cận chứ không chỉ kết luận cuối cùng.',
        references: ['Bộ case study nội bộ', 'Placeholder: tình huống mẫu ôn tập'],
        estimatedStudyTime: 18,
      },
    ],
  },
  {
    id: 'topic-10',
    code: 'CD10',
    name: 'Xử lý kiến nghị, kiểm tra, giám sát trong đấu thầu',
    shortDescription: 'Bao quát kiến nghị, khởi kiện, kiểm tra, báo cáo và giám sát.',
    learningObjectives: [
      'Nắm điều kiện để kiến nghị được xem xét và quy trình giải quyết.',
      'Hiểu vai trò của khởi kiện, báo cáo, kiểm tra và giám sát trong quản trị đấu thầu.',
      'Biết phân biệt đúng từng cơ chế xử lý sau lựa chọn nhà thầu.',
    ],
    summary:
      'Chuyên đề cuối đi vào cơ chế kiểm soát và bảo đảm trách nhiệm giải trình. Đây là phần quan trọng để học viên nhìn đấu thầu như một quy trình có giám sát liên tục.',
    flashSummary: [
      'Kiến nghị chỉ được xử lý hiệu quả khi đúng điều kiện và đúng quy trình.',
      'Kiểm tra, báo cáo và giám sát là ba công cụ khác nhau nhưng có liên hệ chặt chẽ.',
      'Khởi kiện và biện pháp khẩn cấp tạm thời cần đọc đúng bối cảnh áp dụng.',
    ],
    tags: ['kiến nghị', 'kiểm tra', 'giám sát', 'khởi kiện'],
    order: 10,
    lessons: [
      {
        idSuffix: 'petition-process',
        title: 'Điều kiện xem xét và quy trình giải quyết kiến nghị',
        content:
          '## Kiến nghị trong lựa chọn nhà thầu\nĐề thi thường yêu cầu xác định khi nào kiến nghị được xem xét, ai có trách nhiệm giải quyết và theo trình tự nào.\n\n## Mẹo\nHọc theo trục: điều kiện, chủ thể giải quyết, trình tự, kết quả xử lý.',
        keyPoints: [
          'Kiến nghị chỉ được xem xét khi đáp ứng điều kiện theo phạm vi và trình tự phù hợp.',
          'Quy trình giải quyết kiến nghị cần được đọc theo đúng vai trò của từng chủ thể.',
          'Sai bước hoặc sai chủ thể trong giải quyết kiến nghị dễ dẫn đến đáp án sai.',
        ],
        quickNotes: [
          'Đừng bỏ qua điều kiện đầu vào khi đọc câu hỏi về kiến nghị.',
          'Nếu đề đổi chủ thể giải quyết, hãy kiểm tra lại toàn bộ quy trình.',
          'Học kiến nghị bằng timeline sẽ dễ nhớ hơn học từng mẩu rời.',
        ],
        example: 'Ví dụ: Một kiến nghị gửi đúng nội dung nhưng sai trình tự có thể không được xem xét như kỳ vọng.',
        references: ['Placeholder: điều kiện và quy trình giải quyết kiến nghị', 'Sơ đồ quy trình kiến nghị'],
        estimatedStudyTime: 20,
      },
      {
        idSuffix: 'litigation-reporting',
        title: 'Khởi kiện, biện pháp khẩn cấp tạm thời, kiểm tra và báo cáo',
        content:
          '## Cơ chế sau kiến nghị\nKhi kiến nghị không giải quyết được toàn bộ tranh chấp, người học cần hiểu vai trò của khởi kiện và công cụ pháp lý liên quan.\n\n## Kiểm tra và báo cáo\nĐây là cơ chế quản trị giúp phát hiện, tổng hợp và xử lý vấn đề trong hoạt động đấu thầu.',
        keyPoints: [
          'Khởi kiện và yêu cầu áp dụng biện pháp khẩn cấp tạm thời phải được hiểu trong đúng bối cảnh pháp lý.',
          'Kiểm tra công tác đấu thầu là hoạt động đánh giá, phát hiện và chấn chỉnh trong quá trình thực hiện.',
          'Báo cáo công tác đấu thầu giúp tổng hợp dữ liệu phục vụ quản lý và giám sát.',
        ],
        quickNotes: [
          'Không đồng nhất giải quyết kiến nghị với khởi kiện tại tòa án.',
          'Kiểm tra là hành động quản lý, báo cáo là công cụ tổng hợp thông tin.',
          'Câu hỏi hay đánh tráo mục đích của các cơ chế này, cần đọc thật chậm.',
        ],
        example: 'Ví dụ: Câu hỏi có thể yêu cầu chọn cơ chế phù hợp khi tranh chấp đã vượt khỏi phạm vi giải quyết kiến nghị.',
        references: ['Placeholder: cơ chế khởi kiện', 'Placeholder: biểu mẫu báo cáo công tác đấu thầu'],
        estimatedStudyTime: 22,
      },
      {
        idSuffix: 'supervision',
        title: 'Giám sát hoạt động đấu thầu và sử dụng dữ liệu giám sát',
        content:
          '## Giám sát\nGiám sát không chỉ nhằm phát hiện sai phạm mà còn giúp cải thiện chất lượng quản trị, tăng minh bạch và ngăn ngừa rủi ro lặp lại.\n\n## Dữ liệu giám sát\nKết quả giám sát cần được chuyển hóa thành hành động cải thiện quy trình và năng lực thực hiện.',
        keyPoints: [
          'Giám sát hoạt động đấu thầu hướng tới minh bạch, trách nhiệm giải trình và phòng ngừa rủi ro.',
          'Dữ liệu giám sát cần được dùng để điều chỉnh quy trình và nâng chất lượng quản trị.',
          'Giám sát hiệu quả đòi hỏi xác định đúng chỉ báo, đúng chủ thể và đúng mục tiêu theo dõi.',
        ],
        quickNotes: [
          'Đừng hiểu giám sát chỉ là kiểm tra sau khi có sai phạm.',
          'Kết quả giám sát nên được đọc như dữ liệu cải tiến liên tục.',
          'Nếu đề hỏi mục tiêu giám sát, hãy nghĩ đến minh bạch và phòng ngừa.',
        ],
        example: 'Ví dụ: Báo cáo giám sát phát hiện nhiều lỗi lặp lại có thể là cơ sở để kiến nghị chấn chỉnh quy trình.',
        references: ['Placeholder: quy định về giám sát hoạt động đấu thầu', 'Bộ chỉ báo giám sát nội bộ'],
        estimatedStudyTime: 18,
      },
    ],
  },
];
