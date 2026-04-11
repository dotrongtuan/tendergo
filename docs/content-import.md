# TenderGO content import

This guide explains how to refresh the TenderGO learning catalog from source DOCX files.

## Source files

Place the topic and exam DOCX files in one directory. The current workspace uses:

`D:\Data\TUANDT\ĐẤU THẦU`

Expected topic files:

- `chuyen_de_1_dau_thau.docx`
- `chuyen_de_2_ke_hoach_tong_the_ke_hoach_lcnt.docx`
- `chuyen_de_3_quy_trinh_thu_tuc_lua_chon_nha_thau.docx`
- `chuyen_de_4_mua_sam_tap_trung.docx`
- `chuyen_de_5_mua_sam_linh_vuc_y_te.docx`
- `chuyen_de_6_dau_thau_qua_mang.docx`
- `chuyen_de_7_hop_dong.docx`
- `chuyen_de_8_xu_ly_tinh_huong_trong_dau_thau.docx`
- `chuyen_de_10_xu_ly_kien_nghi_kiem_tra_giam_sat_trong_dau_thau.docx`

Expected general exam files:

- `bai_thi_thu_trac_nghiem_kien_thuc_chung_dau_thau.docx`
- `Bài kiểm tra trắc nghiệm chứng chỉ đấu thầu tổng quát.docx`

## Run import

```powershell
cd D:\Data\RESEARCH\CODEX\tendergo
npm run import:dataset -- --input-dir "D:\Data\TUANDT\ĐẤU THẦU"
```

## Generated files

- `src/mock/imported/tenderTrainingData.json`
- `src/mock/imported/tenderExamSets.json`
- `src/mock/imported/tenderImportReport.json`

## After import

Run verification:

```powershell
npm run typecheck
```

Then open the app and check:

- `Trung tâm dữ liệu` for import timestamp, source folder, and per-topic coverage
- `Chuyên đề` screens for lesson/source metadata
- `Ngân hàng câu hỏi` and `Thi thử` for imported questions

## Notes

- Keep topic numbering unchanged, including the missing Topic 9.
- The parser extracts structured lessons, question banks, and legal-reference metadata where available.
- Imported legal references and question explanations should still be reviewed by procurement subject matter experts before official use.
