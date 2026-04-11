# Android release guide for TenderGO

Tai lieu nay huong dan build ban cai dat Android de cai len dien thoai that va su dung lau dai.

## 1. Yeu cau moi truong

- Node.js 20.20.2 LTS hoac moi hon
- npm moi theo Node.js
- Tai khoan Expo de su dung EAS Build
- Dien thoai Android that hoac may tinh co `adb` neu muon cai qua USB

## 2. Cai dependency

```powershell
cd D:\Data\RESEARCH\CODEX\tendergo
npm install
npm run typecheck
```

## 3. Dang nhap Expo

```powershell
npx eas-cli login
npx eas-cli whoami
```

Neu day la lan dau build tren tai khoan nay, EAS co the hoi lien ket project voi Expo.

## 4. Build file APK de cai truc tiep len may

```powershell
npm run build:android:apk
```

Profile `preview` trong `eas.json` se build file APK voi che do internal distribution.

## 5. Cai APK len dien thoai

### Cach 1: Cai truc tiep tu link build

- Sau khi build xong, EAS tra ve mot URL.
- Mo URL do tren dien thoai Android.
- Tai file APK va cho phep cai ung dung tu trinh duyet neu he thong hoi.

### Cach 2: Cai qua USB bang ADB

```powershell
adb install D:\duong-dan-den-file.apk
```

Neu dang cap nhat de len ban da cai san:

```powershell
adb install -r D:\duong-dan-den-file.apk
```

## 5.1. Luu y rieng cho Samsung Galaxy A26 5G

- Cach nhanh nhat la mo link build EAS bang Chrome tren dien thoai roi tai file APK.
- Neu Samsung chan cai dat, vao `Cai dat` -> `Bao mat va quyen rieng tu` -> `Cai dat ung dung khong ro nguon goc` va cap quyen cho Chrome hoac My Files.
- Neu muon cai qua cap USB, hay bat `Tuy chon nha phat trien` bang cach vao `Cai dat` -> `Thong tin dien thoai` -> `Thong tin phan mem` -> bam 7 lan vao `So hieu ban dung`.
- Sau do vao `Tuy chon nha phat trien` va bat `USB debugging`.
- Khi cam cap vao may tinh, chon che do truyen tep neu may hoi quyen ket noi USB.
- Neu ADB hoi xac nhan tren dien thoai, bam `Allow` de may tinh duoc phep cai app.

## 6. Build ban phat hanh Google Play sau nay

```powershell
npm run build:android:aab
```

Lenh nay tao file AAB de dua len Google Play Console.

## 7. Nguyen tac de cap nhat lau dai khong mat du lieu

- Giu nguyen `android.package`
- Giu nguyen Android keystore
- Tang `android.versionCode` moi khi phat hanh ban Android moi
- Khong go app neu muon giu du lieu local

## 8. Cau hinh hien tai cua du an

- Android package: `vn.dotrongtuan.tendergo`
- Android versionCode: `1`
- iOS bundleIdentifier: `vn.dotrongtuan.tendergo`
- iOS buildNumber: `1`

## 9. Ghi chu quan trong

- Lan build dau tien, EAS se hoi cach quan ly Android signing. Nen de EAS tao va quan ly keystore neu ban chua co.
- Hay sao luu thong tin keystore sau khi build thanh cong.
- Neu doi package hoac mat keystore, ban se gap van de khi cap nhat ung dung da cai tren may that.
