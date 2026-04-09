import type { TopicBlueprint } from './types';

export const topicSetB: TopicBlueprint[] = [
  {
    id: 'topic-4',
    code: 'CD4',
    name: 'Mua sắm tập trung',
    shortDescription: 'Giải thích nguyên tắc, quy trình, thỏa thuận khung và trách nhiệm.',
    learningObjectives: [
      'Hiểu vai trò của mua sắm tập trung và lợi ích trong chuẩn hóa nhu cầu.',
      'Nắm trình tự triển khai và nội dung thỏa thuận khung.',
      'Xác định được trách nhiệm của các bên tham gia mua sắm tập trung.',
    ],
    summary:
      'Mua sắm tập trung cần học theo luồng vai trò và quy trình. Trọng tâm là chuẩn hóa nhu cầu, thỏa thuận khung và phân định trách nhiệm.',
    flashSummary: [
      'Nguyên tắc cốt lõi là chuẩn hóa, công khai và tối ưu hiệu quả quy mô.',
      'Quy trình phải gắn nhu cầu tổng hợp với thỏa thuận khung và trách nhiệm thực hiện.',
      'Sai trách nhiệm chủ thể là lỗi dễ gặp trong câu hỏi trắc nghiệm.',
    ],
    tags: ['mua sắm tập trung', 'thỏa thuận khung', 'quy trình', 'trách nhiệm'],
    order: 4,
    lessons: [
      {
        idSuffix: 'principles',
        title: 'Nguyên tắc trong mua sắm tập trung',
        content:
          '## Bản chất\nMua sắm tập trung nhằm hợp nhất nhu cầu tương đồng để tăng hiệu quả, chuẩn hóa và minh bạch.\n\n## Ghi nhớ\nLuôn gắn nguyên tắc với mục tiêu hiệu quả tổng thể chứ không chỉ giá thấp.',
        keyPoints: [
          'Mua sắm tập trung phải xuất phát từ nhu cầu có thể chuẩn hóa và tổng hợp hợp lý.',
          'Nguyên tắc công khai, minh bạch và hiệu quả quy mô là nền tảng của mua sắm tập trung.',
          'Không phải mọi nhu cầu mua sắm đều phù hợp để đưa vào cơ chế tập trung.',
        ],
        quickNotes: [
          'Từ khóa chuẩn hóa là dấu hiệu rất mạnh trong nhóm câu hỏi này.',
          'Nếu nhu cầu quá đặc thù, cần cân nhắc lại tính phù hợp của mua sắm tập trung.',
          'Hãy luôn gắn nguyên tắc với mục tiêu hiệu quả tổng thể.',
        ],
        example: 'Ví dụ: Gom nhiều nhu cầu khác biệt vào cùng một gói chưa chắc đã phù hợp với tinh thần mua sắm tập trung.',
        references: ['Placeholder: nguyên tắc mua sắm tập trung', 'Tài liệu chuẩn hóa danh mục nhu cầu'],
        estimatedStudyTime: 16,
      },
      {
        idSuffix: 'process',
        title: 'Quy trình mua sắm tập trung',
        content:
          '## Trình tự\nQuy trình thường bắt đầu từ tổng hợp nhu cầu, xây dựng phương án, lựa chọn nhà thầu và triển khai theo kết quả lựa chọn.\n\n## Mẹo làm bài\nKiểm tra xem đề bài có đảo thứ tự hoặc bỏ thiếu bước chuẩn hóa hay không.',
        keyPoints: [
          'Quy trình mua sắm tập trung bắt đầu từ tổng hợp nhu cầu và chuẩn hóa danh mục.',
          'Các bước lựa chọn nhà thầu phải liên kết chặt với phương án triển khai sau lựa chọn.',
          'Sai trình tự hoặc thiếu căn cứ tổng hợp nhu cầu có thể làm giảm hiệu quả quy trình.',
        ],
        quickNotes: [
          'Hãy nhớ logic: tổng hợp nhu cầu trước rồi mới lựa chọn nhà thầu.',
          'Đề bài mô tả thiếu khâu chuẩn hóa là dấu hiệu cần kiểm tra lại quy trình.',
          'Luôn xác định rõ giai đoạn nào do đơn vị mua sắm tập trung chủ trì.',
        ],
        example: 'Ví dụ: Nếu đề đưa lựa chọn nhà thầu lên trước bước tổng hợp nhu cầu thì khả năng cao là phương án sai.',
        references: ['Placeholder: quy trình mua sắm tập trung', 'Sơ đồ quy trình mẫu'],
        estimatedStudyTime: 18,
      },
      {
        idSuffix: 'framework-responsibility',
        title: 'Nội dung thỏa thuận khung và trách nhiệm trong mua sắm tập trung',
        content:
          '## Thỏa thuận khung\nĐây là mắt xích chuyển từ giai đoạn lựa chọn sang giai đoạn thực hiện theo nhu cầu cụ thể.\n\n## Trách nhiệm\nHọc theo cặp chủ thể - giai đoạn để tránh nhầm lẫn trong câu hỏi trắc nghiệm.',
        keyPoints: [
          'Thỏa thuận khung cần làm rõ phạm vi, điều kiện và cơ chế thực hiện mua sắm tiếp theo.',
          'Trách nhiệm các bên phải được phân định theo vai trò và từng giai đoạn quy trình.',
          'Việc theo dõi thực hiện sau lựa chọn là một phần quan trọng của mua sắm tập trung.',
        ],
        quickNotes: [
          'Đọc câu hỏi trách nhiệm theo cặp chủ thể và giai đoạn.',
          'Không nhầm thỏa thuận khung với hợp đồng cụ thể cho từng nhu cầu phát sinh.',
          'Khi trách nhiệm bị chồng lấn, hãy quay lại bản chất vai trò của đơn vị mua sắm tập trung.',
        ],
        example: 'Ví dụ: Một câu hỏi có thể yêu cầu xác định đơn vị nào chịu trách nhiệm theo dõi việc triển khai thỏa thuận khung.',
        references: ['Placeholder: nội dung tối thiểu của thỏa thuận khung', 'Tài liệu trách nhiệm các chủ thể'],
        estimatedStudyTime: 18,
      },
    ],
  },
  {
    id: 'topic-5',
    code: 'CD5',
    name: 'Mua sắm trong lĩnh vực y tế',
    shortDescription: 'Tập trung vào thuốc, hóa chất, vật tư xét nghiệm và thiết bị y tế.',
    learningObjectives: [
      'Phân biệt đặc thù của mua sắm y tế so với mua sắm thông thường.',
      'Nắm lưu ý khi lựa chọn nhà thầu cho thuốc, hóa chất, vật tư và thiết bị y tế.',
      'Hiểu tinh thần áp dụng ưu đãi trong mua thuốc và kiểm soát rủi ro.',
    ],
    summary:
      'Chuyên đề y tế đòi hỏi vừa bám nguyên tắc đấu thầu chung, vừa chú ý đến tính đặc thù của hàng hóa và yêu cầu chuyên ngành.',
    flashSummary: [
      'Nhận diện đúng nhóm hàng hóa y tế là bước đầu để áp dụng đúng quy trình.',
      'Yếu tố kỹ thuật, tiêu chuẩn chuyên môn và khả năng cung ứng thường là trọng tâm.',
      'Ưu đãi trong mua thuốc phải được hiểu trong đúng điều kiện áp dụng.',
    ],
    tags: ['y tế', 'thuốc', 'thiết bị y tế', 'ưu đãi'],
    order: 5,
    lessons: [
      {
        idSuffix: 'medical-context',
        title: 'Lựa chọn nhà thầu trong bối cảnh mua sắm y tế',
        content:
          '## Đặc thù\nMua sắm y tế thường gắn với yêu cầu chuyên môn, tiêu chuẩn kỹ thuật và tính liên tục trong cung ứng.\n\n## Khi ôn tập\nLuôn xem đề nhấn mạnh vào yếu tố chuyên ngành hay chỉ là nguyên tắc chung.',
        keyPoints: [
          'Mua sắm y tế cần cân bằng giữa yêu cầu chuyên môn, chất lượng và tiến độ cung ứng.',
          'Đặc thù lĩnh vực y tế làm cho tiêu chí kỹ thuật và tính phù hợp sử dụng trở nên rất quan trọng.',
          'Người học phải đọc kỹ loại hàng hóa y tế để xác định đúng trọng tâm đánh giá.',
        ],
        quickNotes: [
          'Không áp dụng máy móc tư duy mua sắm thông thường cho mọi hàng hóa y tế.',
          'Từ khóa về chuyên môn sử dụng thường gợi ý cần xem sâu hơn yếu tố kỹ thuật.',
          'Khi đề nhắc đến liên tục điều trị hoặc xét nghiệm, cần chú ý rủi ro đứt gãy cung ứng.',
        ],
        example: 'Ví dụ: Gói thầu vật tư xét nghiệm có thể đặt nặng tính tương thích hơn một gói văn phòng phẩm.',
        references: ['Placeholder: quy định chuyên ngành y tế', 'Placeholder: hướng dẫn lựa chọn nhà thầu y tế'],
        estimatedStudyTime: 18,
      },
      {
        idSuffix: 'medical-goods',
        title: 'Thuốc, hóa chất, vật tư xét nghiệm và thiết bị y tế',
        content:
          '## Nhóm hàng hóa đặc thù\nMỗi nhóm hàng hóa y tế có đặc điểm riêng về tiêu chí kỹ thuật, chất lượng và quá trình đánh giá.\n\n## Mẹo nhớ\nĐọc kỹ xem đề đang hỏi về thuốc hay thiết bị để tránh lẫn tiêu chí.',
        keyPoints: [
          'Thuốc, hóa chất, vật tư xét nghiệm và thiết bị y tế không nên được đánh giá như một nhóm đồng nhất.',
          'Tính tương thích và khả năng vận hành thực tế là yếu tố quan trọng đối với nhiều hàng hóa y tế.',
          'Đề bài càng mô tả sâu yếu tố kỹ thuật thì càng cần bám sát đặc thù của từng nhóm hàng hóa.',
        ],
        quickNotes: [
          'Đọc kỹ xem đề đang hỏi về thuốc hay thiết bị để tránh lẫn tiêu chí.',
          'Không bỏ qua các yếu tố vận hành, bảo trì hoặc tương thích trong thiết bị y tế.',
          'Nhóm vật tư xét nghiệm thường gắn với yêu cầu sử dụng đồng bộ trong thực tế.',
        ],
        example: 'Ví dụ: Một câu hỏi có thể kiểm tra việc ưu tiên tính tương thích của hóa chất với hệ thống xét nghiệm đang vận hành.',
        references: ['Placeholder: quy định chuyên ngành theo nhóm hàng hóa', 'Bảng ghi nhớ tiêu chí theo nhóm hàng hóa y tế'],
        estimatedStudyTime: 22,
      },
      {
        idSuffix: 'drug-preferences',
        title: 'Ưu đãi trong mua thuốc và kiểm soát rủi ro',
        content:
          '## Ưu đãi trong mua thuốc\nNgười học cần phân biệt ưu đãi hợp lệ với việc áp dụng ưu đãi một cách cơ học hoặc vượt phạm vi.\n\n## Kiểm soát rủi ro\nMọi ưu đãi đều cần đặt trong khung yêu cầu chất lượng, an toàn và khả năng đáp ứng.',
        keyPoints: [
          'Ưu đãi trong mua thuốc phải được áp dụng đúng điều kiện và đúng mục tiêu chính sách.',
          'Không nên tách yếu tố ưu đãi khỏi yêu cầu chất lượng và khả năng đáp ứng chuyên môn.',
          'Kiểm soát rủi ro trong mua thuốc đòi hỏi nhìn đồng thời vào giá, chất lượng và tính sẵn sàng cung ứng.',
        ],
        quickNotes: [
          'Ưu đãi không đồng nghĩa với bỏ qua tiêu chuẩn chuyên môn.',
          'Nếu đáp án chỉ nói về giá mà bỏ quên chất lượng, cần xem lại.',
          'Hãy gắn ưu đãi với điều kiện áp dụng cụ thể trong câu hỏi.',
        ],
        example: 'Ví dụ: Đáp án nêu ưu đãi nhưng bỏ qua điều kiện chất lượng thường là đáp án chưa đầy đủ.',
        references: ['Placeholder: quy định về ưu đãi trong mua thuốc', 'Checklist nội bộ kiểm soát rủi ro'],
        estimatedStudyTime: 18,
      },
    ],
  },
  {
    id: 'topic-6',
    code: 'CD6',
    name: 'Đấu thầu qua mạng',
    shortDescription: 'Trang bị nguyên tắc chung, điều kiện áp dụng và quy trình trên hệ thống.',
    learningObjectives: [
      'Hiểu vai trò của hệ thống điện tử trong lựa chọn nhà thầu.',
      'Nắm quy trình cơ bản khi tổ chức đấu thầu qua mạng.',
      'Nhận diện lỗi thao tác hoặc lỗi minh bạch thường gặp trên môi trường số.',
    ],
    summary:
      'Đấu thầu qua mạng là chuyên đề kết nối giữa pháp luật đấu thầu và quy trình vận hành trên hệ thống. Câu hỏi thường vừa kiểm tra nguyên tắc, vừa kiểm tra thao tác.',
    flashSummary: [
      'Môi trường số không thay thế nguyên tắc pháp lý mà là công cụ thực thi minh bạch hơn.',
      'Cần nắm các bước đăng tải, phát hành, nộp và đánh giá hồ sơ trên hệ thống.',
      'Nhiều lỗi sai xuất phát từ không kiểm tra đủ thông tin, mốc thời gian và quyền truy cập.',
    ],
    tags: ['đấu thầu qua mạng', 'quy trình điện tử', 'hệ thống', 'minh bạch'],
    order: 6,
    lessons: [
      {
        idSuffix: 'basics',
        title: 'Quy định chung và điều kiện triển khai đấu thầu qua mạng',
        content:
          '## Nền tảng pháp lý\nĐấu thầu qua mạng vẫn phải bám các nguyên tắc chung của lựa chọn nhà thầu, đồng thời tuân thủ yêu cầu về môi trường điện tử, tài khoản và dữ liệu.\n\n## Điều kiện\nĐây không chỉ là thao tác kỹ thuật mà còn là yêu cầu về quy trình, chủ thể và công khai.',
        keyPoints: [
          'Đấu thầu qua mạng phải bảo đảm đồng thời tính hợp lệ pháp lý và tính đầy đủ của thao tác điện tử.',
          'Điều kiện triển khai bao gồm chủ thể, tài khoản, dữ liệu và sự phù hợp của quy trình trên hệ thống.',
          'Mọi thông tin đăng tải trên hệ thống đều phải phục vụ minh bạch và truy vết được.',
        ],
        quickNotes: [
          'Đừng xem đấu thầu qua mạng chỉ là việc chuyển hồ sơ giấy sang bản điện tử.',
          'Nếu đề nói thiếu thông tin đăng tải, hãy nghĩ ngay đến rủi ro minh bạch.',
          'Tài khoản và quyền thao tác trên hệ thống cũng là một phần của điều kiện triển khai.',
        ],
        example: 'Ví dụ: Quy trình điện tử vẫn có thể sai nếu thông tin đăng tải không đầy đủ hoặc sai thời điểm.',
        references: ['Placeholder: quy định chung về đấu thầu qua mạng', 'Placeholder: hướng dẫn sử dụng hệ thống'],
        estimatedStudyTime: 18,
      },
      {
        idSuffix: 'process',
        title: 'Quy trình lựa chọn nhà thầu qua mạng',
        content:
          '## Timeline quy trình\nHãy hình dung quy trình như một luồng dữ liệu từ chuẩn bị, đăng tải, nộp hồ sơ, mở thầu, đánh giá đến phê duyệt kết quả.\n\n## Mẹo\nCác câu hỏi hay kiểm tra mốc thời gian và trách nhiệm cập nhật thông tin.',
        keyPoints: [
          'Quy trình qua mạng cần được nhớ theo đúng thứ tự thao tác trên hệ thống.',
          'Mốc thời gian và trạng thái dữ liệu là yếu tố quan trọng trong đánh giá tính hợp lệ.',
          'Bên mời thầu và nhà thầu đều phải thực hiện đúng vai trò trên môi trường điện tử.',
        ],
        quickNotes: [
          'Hãy học quy trình như một timeline thay vì học rời từng bước.',
          'Nếu đề bài đảo thứ tự mở thầu và đánh giá, nhiều khả năng đó là phương án sai.',
          'Tính hợp lệ trên hệ thống không tách rời khỏi tính hợp lệ của hồ sơ.',
        ],
        example: 'Ví dụ: Câu hỏi có thể kiểm tra xem bước đăng tải hay nộp hồ sơ điện tử diễn ra trước.',
        references: ['Sơ đồ quy trình đấu thầu qua mạng', 'Placeholder: văn bản hướng dẫn lựa chọn qua mạng'],
        estimatedStudyTime: 20,
      },
      {
        idSuffix: 'risks',
        title: 'Sai sót thường gặp và checklist kiểm tra trên hệ thống',
        content:
          '## Lỗi hay gặp\nSai sót thường đến từ việc nhập thiếu dữ liệu, chọn sai biểu mẫu, nhầm thời hạn hoặc không rà soát trạng thái hồ sơ.\n\n## Checklist\nMỗi bước trên hệ thống nên gắn với một câu hỏi kiểm tra ngắn.',
        keyPoints: [
          'Sai sót về dữ liệu và thời hạn trên hệ thống có thể ảnh hưởng trực tiếp đến tính hợp lệ của hồ sơ.',
          'Checklist kiểm tra trước khi xác nhận thao tác là công cụ giảm lỗi rất hiệu quả.',
          'Việc lưu vết điện tử giúp phát hiện lỗi nhưng không thay thế trách nhiệm rà soát của người thực hiện.',
        ],
        quickNotes: [
          'Kiểm tra lại mốc thời gian trước mọi thao tác nộp hoặc phê duyệt.',
          'Biểu mẫu điện tử đúng là điều kiện tối thiểu, chưa đủ nếu nội dung vẫn thiếu logic.',
          'Nên gắn mỗi bước trên hệ thống với một câu hỏi kiểm tra ngắn.',
        ],
        example: 'Ví dụ: Hồ sơ có thể nộp đúng hạn nhưng vẫn rủi ro nếu biểu mẫu cốt lõi bị bỏ trống.',
        references: ['Checklist thao tác an toàn trên hệ thống', 'Placeholder: lỗi phổ biến khi đấu thầu qua mạng'],
        estimatedStudyTime: 18,
      },
    ],
  },
];
