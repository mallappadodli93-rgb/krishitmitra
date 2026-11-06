// AI Farming Assistant Service
// Supports Multilingual Answers: Kannada (kn), English (en), Hindi (hi)
// Ready for future AI API integration (e.g. Google Gemini, OpenAI, or Custom Agronomy Backend)

const PREDEFINED_RESPONSES = {
  kn: {
    crop: `🌱 **ಬೆಳೆ ಆಯ್ಕೆಯ ಶಿಫಾರಸುಗಳು:**
ಉತ್ತಮ ಬೆಳೆ ಆಯ್ಕೆಯು ಮುಖ್ಯವಾಗಿ ನಿಮ್ಮ **ಮಣ್ಣಿನ ಪ್ರಕಾರ**, **ಪ್ರಸ್ತುತ ಋತು** ಮತ್ತು **ನೀರಿನ ಲಭ್ಯತೆ** ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ:

1. **ಹಿಂಗಾರು (ರಬಿ / ಚಳಿಗಾಲ) ಹಂಗಾಮಿಗೆ:**
   - **ಮೆಕ್ಕಲು / ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು:** ಗೋಧಿ (*HD-3086, DBW-187*) ಅಥವಾ ಸಾಸಿವೆ (*Pusa Bold*).
   - **ಕರಿ ಮಣ್ಣು:** ಕಡಲೆ (*JG-14*), ಹಿಂಗಾರು ಜೋಳ, ಅಥವಾ ಕುಸುಮೆ.
   - **ಕೆಂಪು ಮರಳು ಮಣ್ಣು:** ಬಾರ್ಲಿ, ಸಾಸಿವೆ, ಅಥವಾ ತೊಗರಿ.

2. **ಮುಂಗಾರು (ಖಾರೀಫ್ / ಮಳೆಗಾಲ) ಹಂಗಾಮಿಗೆ:**
   - **ಹೆಚ್ಚು ಮಳೆ / ಹೇರಳ ನೀರು:** ಭತ್ತ, ಕಬ್ಬು.
   - **ಮಧ್ಯಮ ಮಳೆ:** ಸೋಯಾಬೀನ್ (*JS-9560*), ಹತ್ತಿ, ಮೆಕ್ಕೆಜೋಳ, ಅಥವಾ ತೊಗರಿ.

3. **ಪ್ರಮುಖ ಸಲಹೆ:** ನಿಮ್ಮ ಮಣ್ಣಿನ pH ಮತ್ತು ವಿಸ್ತೀರ್ಣಕ್ಕೆ ತಕ್ಕಂತೆ ನಿಖರ ಲಾಭದ ಲೆಕ್ಕಾಚಾರ ಪಡೆಯಲು ನಮ್ಮ **[ಬೆಳೆ ಶಿಫಾರಸು ಎಂಜಿನ್](#crop-recommendation)** ಬಳಸಿ!`,

    disease: `🛡️ **ಸಮಗ್ರ ಸಸ್ಯ ರೋಗ ನಿರ್ವಹಣಾ ವಿಧಾನಗಳು:**

ಬೆಳೆ ರೋಗಗಳನ್ನು ಆರಂಭದಲ್ಲೇ ಗುರುತಿಸಿ ನೈಸರ್ಗಿಕ ಮತ್ತು ಸುರಕ್ಷಿತ ರಾಸಾಯನಿಕ ಕ್ರಮಗಳ ಮೂಲಕ ನಿಯಂತ್ರಿಸಬಹುದು:

1. **ರೋಗದ ಲಕ್ಷಣಗಳನ್ನು ಮೊದಲೇ ಪತ್ತೆಹಚ್ಚಿ:**
   - **ಶಿಲೀಂಧ್ರ ರೋಗಗಳು (ಬೂದಿ ರೋಗ, ತುಕ್ಕು ರೋಗ, ಎಲೆ ಕರಕಲು):** ಎಲೆಗಳ ಮೇಲೆ ಪುಡಿಯಂತಹ ಮಚ್ಚೆಗಳು ಅಥವಾ ಕಂದು ಬಣ್ಣದ ವೃತ್ತಗಳು ಕಾಣಿಸುತ್ತವೆ.
   - **ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗಗಳು (ಎಲೆ ಚುಕ್ಕೆ, ಸೊರಗು ರೋಗ):** ಎಣ್ಣೆ ಸವರಿದಂತಹ ನೀರಿನಂಶದ ಚುಕ್ಕೆಗಳು.
   - **ವೈರಸ್ ರೋಗಗಳು (ಎಲೆ ಮುದುಡು ರೋಗ):** ಬಿಳಿ ನೊಣ ಮತ್ತು ಹೇನುಗಳಂತಹ ಕೀಟಗಳಿಂದ ಹರಡುತ್ತದೆ.

2. **ನೈಸರ್ಗಿಕ ಮತ್ತು ಜೈವಿಕ ನಿಯಂತ್ರಣ:**
   - ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬೀಜಗಳಿಗೆ *ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡೆ* ಅಥವಾ *ಸ್ಯೂಡೋಮೊನಾಸ್* 5-10 ಗ್ರಾಂ/ಕೆಜಿ ಬೆರೆಸಿ ಬೀಜೋಪಚಾರ ಮಾಡಿ.
   - ಮುಂಜಾನೆ **ಬೇವಿನ ಎಣ್ಣೆ (1500 ppm @ 5 ಮಿಲಿ/ಲೀಟರ್)** ಸಿಂಪಡಿಸಿ.
   - ನೈಸರ್ಗಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹೆಚ್ಚಿಸಲು ಹುಳಿ ಮಜ್ಜಿಗೆ (50 ಮಿಲಿ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.

3. **ಸೂಕ್ತ ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ:**
   - **ಗೋಧಿಯ ಹಳದಿ ತುಕ್ಕು ರೋಗ:** *ಪ್ರೊಪಿಕೊನಜೋಲ್ 25% EC (ಟಿಲ್ಟ್)* 1 ಮಿಲಿ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.
   - **ಟೊಮೆಟೊ ಎಲೆ ಕರಕಲು ರೋಗ:** *ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP* 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.

*💡 ಸಲಹೆ: ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ನಮ್ಮ **[ರೋಗ ಪತ್ತೆ ಪುಟದಲ್ಲಿ](#disease-detection)** ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ತಕ್ಷಣ ನಿಖರ ಚಿಕಿತ್ಸೆ ತಿಳಿಯಿರಿ!*`,

    water: `💧 **ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ & ಮಾರ್ಗದರ್ಶನ:**

ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ ನೀರು ಹಾಯಿಸುವುದರಿಂದ 30% ನೀರು ಉಳಿತಾಯವಾಗುವುದಲ್ಲದೆ ಬೇರು ಕೊಳೆ ರೋಗ ತಡೆಗಟ್ಟಬಹುದು:

1. **ದಿನದ ಅತ್ಯುತ್ತಮ ಸಮಯ:**
   - **ಮುಂಜಾನೆ (ಬೆಳಿಗ್ಗೆ 6:00 ರಿಂದ 9:00):** ಆವಿಯಾಗುವಿಕೆ ಕಡಿಮೆ ಮತ್ತು ಎಲೆಗಳು ಬೇಗನೆ ಒಣಗುವುದರಿಂದ ಶಿಲೀಂಧ್ರ ರೋಗ ಬರುವುದಿಲ್ಲ.
   - **ಸಂಜೆ ವೇಳೆ (5:30 ರ ನಂತರ):** ಬಿಸಿಲಿನ ದಿನಗಳಲ್ಲಿ ಹನಿ ನೀರಾವರಿ ನೀಡಲು ಸೂಕ್ತ.
   - **ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲಿನಲ್ಲಿ (12:00 ರಿಂದ 3:30) ನೀರು ಹಾಯಿಸಬೇಡಿ:** ಇದರಿಂದ ನೀರು ಆವಿಯಾಗುತ್ತದೆ ಮತ್ತು ಗಿಡಕ್ಕೆ ಹಾನಿಯಾಗುತ್ತದೆ.

2. **ಬೆಳೆಯ ಪ್ರಮುಖ ನೀರಾವರಿ ಹಂತಗಳು:**
   - **ಗೋಧಿ:** ಬಿತ್ತಿದ **21-25 ದಿನಗಳಲ್ಲಿ (ಕಿರೀಟ ಬೇರು ಬಿಡುವ ಹಂತ - CRI)** ಮೊದಲ ನೀರು ಅತ್ಯಗತ್ಯ.
   - **ಕಡಲೆ:** ಹೂ ಬಿಡುವ ಮೊದಲು ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ. **ಪೂರ್ಣ ಹೂ ಬಿಡುವ ಹಂತದಲ್ಲಿ ನೀರು ಹಾಯಿಸಬೇಡಿ**, ಹೂವುಗಳು ಉದುರುತ್ತವೆ!
   - **ಸಾಸಿವೆ:** ಹೂ ಬಿಡುವ ಮುನ್ನ (30 ದಿನ) ಮತ್ತು ಕಾಯಿ ತುಂಬುವ ಹಂತ (60 ದಿನ).

3. **ಹವಾಮಾನ ಪರಿಶೀಲನೆ:** ಮಳೆ ಬರುವ 48 ಗಂಟೆ ಮೊದಲು ನೀರು ಹಾಯಿಸುವುದನ್ನು ಮುಂದೂಡಿ, ಇದರಿಂದ ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲುವುದು ತಪ್ಪುತ್ತದೆ.`,

    fertilizer: `🧪 **ಸಮತೋಲಿತ ರಸಗೊಬ್ಬರ & ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ಮಾರ್ಗದರ್ಶಿ:**

ಬೆಳೆಯ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ ಸಮತೋಲಿತ **ಎನ್-ಪಿ-ಕೆ (ಸಾರಜನಕ, ರಂಜಕ, ಪೊಟ್ಯಾಷ್)** ನೀಡುವುದು ಅತ್ಯಗತ್ಯ:

1. **ಬುಡ ಗೊಬ್ಬರ (ಬಿತ್ತನೆಯ ಸಮಯದಲ್ಲಿ):**
   - **100% ರಂಜಕ (DAP)** ಮತ್ತು **ಪೊಟ್ಯಾಷ್ (MOP)** ಅನ್ನು ಬಿತ್ತನೆ ಮಾಡುವಾಗಲೇ ಮಣ್ಣಿಗೆ ಸೇರಿಸಿ.
   - ಎಕರೆಗೆ 2-3 ಟನ್ ಚೆನ್ನಾಗಿ ಕಳಿತ **ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ** ಅಥವಾ ಎರೆಹುಳು ಗೊಬ್ಬರ ಹಾಕಿ ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಿ.

2. **ಮೇಲುಗೊಬ್ಬರ (ಬೆಳವಣಿಗೆಯ ಹಂತದಲ್ಲಿ):**
   - **ಯೂರಿಯಾವನ್ನು (ಸಾರಜನಕ)** ಒಂದೇ ಬಾರಿ ಹಾಕದೆ 2 ರಿಂದ 3 ಕಂತುಗಳಲ್ಲಿ ನೀರಾವರಿಯೊಂದಿಗೆ ಕೊಡಿ.
   - ಗೋಧಿಗೆ: ಮೊದಲ ನೀರು ಹಾಯಿಸಿದ ನಂತರ (21-25 ದಿನ) ಮೊದಲ ಕಂತಿನ ಯೂರಿಯಾ ಹಾಕಿ.

3. **ಲಘು ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ:**
   - **ಸತು (ಜಿಂಕ್) ಕೊರತೆ (ಎಲೆ ಹಳದಿಯಾಗುವುದು):** 0.5% ಜಿಂಕ್ ಸಲ್ಫೇಟ್ + 0.25% ಸುಣ್ಣದ ತಿಳಿನೀರು ಸಿಂಪಡಿಸಿ.
   - **ಎಣ್ಣೆಕಾಳು ಬೆಳೆಗಳಿಗೆ ಗಂಧಕ (ಸಲ್ಫರ್):** ಎಕರೆಗೆ 20 ಕೆಜಿ ಗಂಧಕ ನೀಡಿದರೆ ಬೀಜದಲ್ಲಿ ಎಣ್ಣೆಯ ಅಂಶ 2.5-3% ಹೆಚ್ಚುತ್ತದೆ.

*💡 ಸಲಹೆ: ನಿಮ್ಮ ಜಮೀನಿಗೆ ಬೇಕಾದ ನಿಖರ ಗೊಬ್ಬರದ ಚೀಲಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿರುವ **ಮಣ್ಣಿನ ಮಾಹಿತಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್** ಬಳಸಿ!*`,

    rice: `🌾 **ಭತ್ತ ಬೆಳೆಯಲು ಅತ್ಯುತ್ತಮ ಋತು & ಬಿತ್ತನೆ ಸಮಯ:**

ಭಾರತದಲ್ಲಿ ಭತ್ತವನ್ನು ಮುಖ್ಯವಾಗಿ ಮೂರು ಋತುಗಳಲ್ಲಿ ಬೆಳೆಯಲಾಗುತ್ತದೆ:

1. **ಖಾರೀಫ್ (ಮುಂಗಾರು - ಮುಖ್ಯ ಋತು) — [ಅತ್ಯಂತ ಜನಪ್ರಿಯ]:**
   - **ಸಸಿ ಮಡಿ ಸಿದ್ಧತೆ:** ಮೇ ನಿಂದ ಜೂನ್.
   - **ನಾಟಿ ಮಾಡುವ ಸಮಯ:** ಜೂನ್ ನಿಂದ ಜುಲೈ (ನೈರುತ್ಯ ಮುಂಗಾರು ಮಳೆಯ ಆರಂಭ).
   - **ಕೊಯ್ಲು:** ನವೆಂಬರ್ ನಿಂದ ಡಿಸೆಂಬರ್.
   - **ಉತ್ತಮ ತಳಿಗಳು:** *ಪೂಸಾ ಬಾಸುಮತಿ 1121, ಪೂಸಾ 1509, ಸಾಂಬಾ ಮಸೂರಿ, ಸ್ವರ್ಣ, IR-64*.

2. **ರಬಿ (ಹಿಂಗಾರು ಭತ್ತ):**
   - ದಕ್ಷಿಣ ಮತ್ತು ಪೂರ್ವ ಭಾರತದಲ್ಲಿ (ಕರ್ನಾಟಕ, ಆಂಧ್ರಪ್ರದೇಶ, ತಮಿಳುನಾಡು, ಪಶ್ಚಿಮ ಬಂಗಾಳ).
   - **ಬಿತ್ತನೆ:** ನವೆಂಬರ್ ನಿಂದ ಡಿಸೆಂಬರ್; **ಕೊಯ್ಲು:** ಏಪ್ರಿಲ್ ನಿಂದ ಮೇ.

3. **ಬೇಸಿಗೆ ಭತ್ತ (ಜೈದ್):**
   - ನೀರಾವರಿ ಸೌಲಭ್ಯವಿದ್ದರೆ ಫೆಬ್ರವರಿ-ಮಾರ್ಚ್‌ನಲ್ಲಿ ನಾಟಿ ಮಾಡಿ ಮೇ-ಜೂನ್‌ನಲ್ಲಿ ಕೊಯ್ಲು ಮಾಡಬಹುದು.

4. **ಮುಖ್ಯ ಸಲಹೆ:** ಗಿಡ ಕವಲೊಡೆಯುವ ಹಂತದಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ಮಾತ್ರ ನೀರು ನಿಲ್ಲಿಸಿ. ಪರ್ಯಾಯ ತೇವ ಮತ್ತು ಒಣಗಿಸುವ (AWD) ಪದ್ಧತಿ ಅನುಸರಿಸಿ 25% ನೀರು ಉಳಿಸಿ.`,

    weather: `🌦️ **ಹವಾಮಾನ & ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ:**
ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳು ಮತ್ತು ಲೈವ್ 5 ದಿನಗಳ ಮಳೆ ಮುನ್ಸೂಚನೆಗಾಗಿ ನಮ್ಮ **[ಹವಾಮಾನ ಪುಟಕ್ಕೆ](#weather)** ಭೇಟಿ ನೀಡಿ. ಇದು ನಿಮ್ಮ ಜಿಲ್ಲೆಗೆ ನೈಜ-ಸಮಯದ ಸಿಂಪಡಣೆ ಸುರಕ್ಷತೆ, ತೇವಾಂಶ ಮತ್ತು ಗಾಳಿಯ ವೇಗವನ್ನು ಒದಗಿಸುತ್ತದೆ.`,

    scheme: `🏛️ **ರೈತ ಕಲ್ಯಾಣ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು:**
1. **ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ:** ರೈತರ ಖಾತೆಗೆ ವಾರ್ಷಿಕ ₹6,000 (ತಲಾ ₹2,000 ರ 3 ಕಂತುಗಳು).
2. **ಪ್ರಧಾನಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ (PMFBY):** ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳಿಂದ ಬೆಳೆ ನಷ್ಟವಾದರೆ ಪರಿಹಾರ (ಖಾರೀಫ್‌ಗೆ 2%, ರಬಿಗೆ 1.5% ಪ್ರೀಮಿಯಂ).
3. **ಸೋಲಾರ್ ಪಂಪ್ ಸಬ್ಸಿಡಿ (PM-KUSUM):** ಸೋಲಾರ್ ಪಂಪ್ ಅಳವಡಿಕೆಗೆ ಭಾರಿ ಸಬ್ಸಿಡಿ ಲಭ್ಯವಿದೆ.
ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ **1800-180-1551** (ಉಚಿತ) ಸಂಪರ್ಕಿಸಿ.`,

    mandi: `📊 **ಲೈವ್ ಎಪಿಎಂಸಿ ಮಂಡಿ ದರಗಳು:**
ಇಂದಿನ ಸರಾಸರಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು:
- **ಗೋಧಿ:** ₹2,680 / ಕ್ವಿಂಟಾಲ್
- **ಬಾಸುಮತಿ ಭತ್ತ:** ₹4,150 / ಕ್ವಿಂಟಾಲ್
- **ಸೋಯಾಬೀನ್:** ₹4,820 / ಕ್ವಿಂಟಾಲ್
- **ಹತ್ತಿ:** ₹7,420 / ಕ್ವಿಂಟಾಲ್
ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಮುಖಪುಟದ ಮಾರುಕಟ್ಟೆ ವಿಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ!`,

    fallback: (query) => `🙏 **ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ!**
ನಿಮ್ಮ ಪ್ರಶ್ನೆ: *"${query}"*.

ನಮ್ಮ ಕೃಷಿ ಸಲಹೆ:
- ಬೆಳೆಯ ತೇವಾಂಶ ಮತ್ತು ಕೀಟಗಳ ಬಾಧೆಯನ್ನು ಮೊದಲೇ ಪತ್ತೆಹಚ್ಚಲು ಪ್ರತಿ 3-4 ದಿನಗಳಿಗೊಮ್ಮೆ ಜಮೀನನ್ನು ಪರಿಶೀಲಿಸಿ.
- ಪ್ರತಿ 2 ವರ್ಷಕ್ಕೊಮ್ಮೆ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಪಡೆಯಿರಿ.
- ರೋಗ ಪತ್ತೆಗಾಗಿ ಎಲೆಯ ಫೋಟೋವನ್ನು ನಮ್ಮ **[ರೋಗ ಪತ್ತೆ ಪುಟದಲ್ಲಿ](#disease-detection)** ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ರಾಷ್ಟ್ರೀಯ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ ಸಂಖ್ಯೆ **1800-180-1551** (ಉಚಿತ ಸಹಾಯವಾಣಿ) ಗೆ ಕರೆ ಮಾಡಿ.

*ತ್ವರಿತ ಉತ್ತರಕ್ಕಾಗಿ ನೀವು ಮೇಲಿನ ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳ ಮೇಲೂ ಕ್ಲಿಕ್ ಮಾಡಬಹುದು!*`
  },

  en: {
    crop: `🌱 **Crop Selection Recommendation:**
The best crop to grow depends primarily on your **soil type**, **current season**, and **water availability**:

1. **For Rabi Season (Winter / Now):**
   - **Alluvial / Loamy Soil:** Wheat (*HD-3086, DBW-187*) or Mustard (*Pusa Bold*).
   - **Black Cotton Soil:** Desi Chickpea / Gram (*JG-14*), Rabi Sorghum, or Safflower.
   - **Lighter Sandy Soil:** Barley, Mustard, or Lentils.

2. **For Kharif Season (Monsoon):**
   - **High Rainfall / Abundant Water:** Basmati Paddy (*Pusa 1121*), Sugarcane.
   - **Medium Rainfall:** Soybean (*JS-9560*), Cotton (*Bt Cotton*), Maize, or Pigeon Pea (Tur).

3. **Key Advice:** Use our **[Crop Recommendation Engine](#crop-recommendation)** to input your exact soil pH and acreage for a tailored profit calculation!`,

    disease: `🛡️ **Integrated Disease Management Protocol:**

Effective plant disease management relies on early diagnosis and balanced cultural + chemical controls:

1. **Identify the Cause Early:**
   - **Fungal (Rust, Blight, Powdery Mildew):** Look for powdery pustules, concentric rings, or moldy growth.
   - **Bacterial (Bacterial Blight, Wilt):** Look for water-soaked angular spots and bacterial ooze.
   - **Viral (Mosaic, Leaf Curl):** Transmitted by sucking pests like whiteflies and thrips.

2. **Organic & Biological Controls:**
   - Treat seeds before sowing with *Trichoderma viride* or *Pseudomonas fluorescens* @ 5–10 g/kg seed.
   - Spray cold-pressed **Neem Oil (1500 ppm @ 5 ml/L)** early morning to deter spore germination.
   - Spray fermented buttermilk (chaach @ 50 ml/L) to build natural acidic fungal resistance.

3. **Targeted Chemical Remedies:**
   - **Yellow Rust on Wheat:** Foliar spray of *Propiconazole 25% EC (Tilt)* @ 1 ml/L.
   - **Tomato Early Blight:** Spray *Mancozeb 75% WP* @ 2.5 g/L or *Azoxystrobin 23% SC* @ 1 ml/L.

*💡 Pro Tip: You can upload an affected leaf on our **[Plant Disease Detection Page](#disease-detection)** for an instant visual diagnosis!*`,

    water: `💧 **Smart Irrigation Scheduling & Guidelines:**

Timing your watering correctly saves up to 30% water and prevents destructive root diseases:

1. **Best Time of Day:**
   - **Early Morning (6:00 AM - 9:00 AM):** Minimal evaporation loss and allows leaves to dry before nightfall, preventing fungal growth.
   - **Late Evening (after 5:30 PM):** Best during hot dry spells for drip irrigation.
   - **Avoid Midday (12:00 PM - 3:30 PM):** High heat causes rapid evaporation and scalding of tender foliage.

2. **Crop-Critical Irrigation Stages:**
   - **Wheat:** Most critical at **Crown Root Initiation (21-25 days after sowing)** and Flowering stage.
   - **Chickpea / Gram:** Irrigate at pre-flowering and pod-filling. **Never irrigate during peak flowering**, which drops flowers!
   - **Mustard:** 2 light irrigations at pre-flowering (30 DAS) and siliquae pod formation (60 DAS).

3. **Weather Check:** Always check rainfall forecasts before watering. If rain is expected within 48 hours, hold flood irrigation to prevent waterlogging.`,

    fertilizer: `🧪 **Balanced Fertilizer & Soil Nutrition Guide:**

A balanced **N-P-K (Nitrogen, Phosphorus, Potassium)** ratio tailored to your crop's growth stage is vital:

1. **Basal Dose (At Time of Sowing):**
   - Apply **100% of Phosphorus (DAP)** and **Potassium (MOP)** at planting.
   - Add well-decomposed **Farm Yard Manure (FYM)** or Vermicompost @ 2–3 tonnes/acre to nurture beneficial soil microbes.

2. **Top Dressing (Vegetative Growth Stage):**
   - Apply **Nitrogen (Urea)** in 2–3 split doses at irrigation intervals (never all at once).
   - For Wheat: Apply first Urea top-dressing immediately after CRI irrigation (21–25 DAS).

3. **Micronutrient Deficiencies:**
   - **Zinc (Khaira disease / leaf yellowing):** Spray 0.5% Zinc Sulfate + 0.25% Lime solution.
   - **Sulfur for Oilseeds (Mustard, Groundnut, Soybean):** Apply 20 kg Elemental Sulfur/acre to increase seed oil content by 2.5–3%.

*💡 Tip: Use our **Soil Information Calculator** on the dashboard to calculate exact 45kg/50kg bag quantities for your field size!*`,

    rice: `🌾 **Optimal Seasons & Sowing Windows for Rice (Paddy):**

In India, rice is cultivated primarily in three major seasons:

1. **Kharif (Aman / Main Season) — [MOST POPULAR]:**
   - **Nursery Sowing:** May to June.
   - **Transplanting:** June to July (with arrival of South-West Monsoon).
   - **Harvesting:** November to December.
   - **Best Varieties:** *Pusa Basmati 1121, Pusa 1509, Samba Mahsuri, Swarna, IR-64*.

2. **Rabi (Boro / Winter Rice):**
   - Grown in Eastern and Southern states (West Bengal, Odisha, Assam, Andhra Pradesh, Tamil Nadu).
   - **Sowing:** November to December; **Harvest:** April to May.

3. **Zaid (Summer Rice / Aus):**
   - Sown in March–April under assured irrigation; harvested in June–July.

4. **Essential Rice Agronomy Tips:**
   - Maintain 2–3 cm shallow standing water during early tillering.
   - Practice Alternate Wetting and Drying (AWD) to save 25% tubewell electricity and reduce greenhouse methane emission.`,

    weather: `🌦️ **Weather & Field Guidance:**
For current weather conditions and live 5-day rain forecasts, please visit our **[Farm Weather Advisory Page](#weather)**. It provides real-time spray safety windows, humidity indices, and soil moisture tracking for your district.`,

    scheme: `🏛️ **Government Welfare Schemes for Farmers:**
1. **PM-KISAN Samman Nidhi:** ₹6,000 annually in 3 installments of ₹2,000 directly to farmer bank accounts via DBT.
2. **PM Fasal Bima Yojana (PMFBY):** Crop insurance covering yield losses due to non-preventable natural risks (2% premium for Kharif, 1.5% for Rabi).
3. **Subsidies on Solar Pumps & Farm Equipment:** Available under the PM-KUSUM scheme via state agriculture departments.
For official verification, call toll-free Kisan Call Center at **1800-180-1551**.`,

    mandi: `📊 **Live Mandi Rates:**
Today's average APMC modal prices:
- **Wheat (Sharbati):** ₹2,680 / Quintal (+₹45 today)
- **Basmati Paddy:** ₹4,150 / Quintal
- **Soybean:** ₹4,820 / Quintal (+₹80 today)
- **Cotton (Kapas):** ₹7,420 / Quintal
Check the full live table on our **[Market Price Section](#mandi)**!`,

    fallback: (query) => `🙏 **Namaste Kisan Bhai!**
Thank you for your question about: *"${query}"*.

Here is our agronomic advice:
- Maintain regular field inspection every 3–4 days to spot early moisture stress or pest eggs.
- Test your soil pH and N-P-K levels every 2 years through your local Soil Health Card center.
- For emergency field diagnosis, upload a leaf photo to our **[Plant Disease Detection Page](#disease-detection)** or call the National Kisan Call Center at **1800-180-1551** (Toll-Free, 22 Languages).

*You can also click any of the suggested questions above for instant agronomic guidance!*`
  },

  hi: {
    crop: `🌱 **फसल चयन सिफारिशें:**
सबसे उपयुक्त फसल का चयन आपकी **मिट्टी के प्रकार**, **वर्तमान मौसम** और **पानी की उपलब्धता** पर निर्भर करता है:

1. **रबी मौसम (सर्दियों / वर्तमान) के लिए:**
   - **दोमट / जलोढ़ मिट्टी:** गेहूं (*HD-3086, DBW-187*) या सरसों (*पूसा बोल्ड*).
   - **काली कपास मिट्टी:** चना (*JG-14*), रबी ज्वार, या कुसुम.
   - **हल्की रेतीली मिट्टी:** जौ, सरसों, या मसूर.

2. **खरीफ मौसम (मानसून) के लिए:**
   - **अधिक वर्षा / प्रचुर पानी:** बासमती धान (*पूसा 1121*), गन्ना.
   - **मध्यम वर्षा:** सोयाबीन (*JS-9560*), कपास, मक्का, या अरहर (तूर).

3. **प्रमुख सलाह:** अपनी मिट्टी के पीएच और खेत के अनुसार सटीक लाभ गणना के लिए हमारे **[फसल सिफारिश इंजन](#crop-recommendation)** का उपयोग करें!`,

    disease: `🛡️ **एकीकृत फसल रोग प्रबंधन:**

पौधों के रोगों का शीघ्र निदान और संतुलित जैविक + रासायनिक नियंत्रण सबसे प्रभावी है:

1. **लक्षणों की जल्द पहचान करें:**
   - **फफूंद रोग (रतुआ, झुलसा, चूर्णिल आसिता):** पत्तियों पर पाउडर जैसे धब्बे या गाढ़े छल्ले।
   - **जीवाणु रोग (बैक्टीरियल ब्लाइट):** पानी जैसे भीगे कोणीय धब्बे।
   - **विषाणु (मोजेक, पत्ती मुड़ना):** सफेद मक्खी और रस चूसक कीटों द्वारा फैलते हैं।

2. **जैविक नियंत्रण:**
   - बुवाई से पहले बीजों को *ट्राइकोडर्मा विरिडी* या *स्यूडोमोनास* 5–10 ग्राम/किग्रा से उपचारित करें।
   - सुबह के समय शुद्ध **नीम का तेल (1500 ppm @ 5 मिली/लीटर)** का छिड़काव करें।
   - प्राकृतिक प्रतिरोधकता बढ़ाने के लिए खट्टी छाछ (50 मिली/लीटर) का छिड़काव करें।

3. **लक्षित रासायनिक उपाय:**
   - **गेहूं का पीला रतुआ:** *प्रोपिकोनाज़ोल 25% EC (टिल्ट)* 1 मिली/लीटर पानी में घोलकर छिड़कें।
   - **टमाटर का अगेती झुलसा:** *मैंकोजेब 75% WP* 2.5 ग्राम/लीटर का छिड़काव करें।

*💡 टिप: सटीक पहचान के लिए अपनी पत्ती की फोटो हमारे **[रोग पहचान पृष्ठ](#disease-detection)** पर अपलोड करें!*`,

    water: `💧 **स्मार्ट सिंचाई समय व दिशानिर्देश:**

सही समय पर पानी देने से 30% पानी की बचत होती है और जड़ गलन रोग से बचाव होता है:

1. **दिन का सर्वोत्तम समय:**
   - **सुबह जल्दी (6:00 से 9:00 बजे):** वाष्पीकरण कम होता है और पत्तियां धूप में सूख जाती हैं जिससे फफूंद नहीं लगती।
   - **देर शाम (5:30 बजे के बाद):** ड्रिप सिंचाई के लिए सर्वोत्तम।
   - **दोपहर (12:00 से 3:30 बजे) बचें:** तेज धूप से पत्तियां झुलस सकती हैं।

2. **महत्वपूर्ण फसल सिंचाई चरण:**
   - **गेहूं:** बुवाई के **21-25 दिन बाद (सीआरआई / ताज जड़ निकलने की अवस्था)** पहली सिंचाई अति आवश्यक है।
   - **चना:** फूल आने से पहले और फलियां बनते समय। **फूल खिलते समय सिंचाई न करें**, इससे फूल झड़ जाते हैं!
   - **सरसों:** फूल आने से पहले (30 दिन) और फलियां बनते समय (60 दिन)।

3. **मौसम की जांच:** बारिश होने से 48 घंटे पहले भारी सिंचाई रोकें ताकि खेतों में जलभराव न हो।`,

    fertilizer: `🧪 **संतुलित उर्वरक व मिट्टी पोषण गाइड:**

फसल की वृद्धि के अनुसार संतुलित **एन-पी-के (नाइट्रोजन, फास्फोरस, पोटाश)** देना आवश्यक है:

1. **बुवाई के समय (बेसल डोज):**
   - **100% फास्फोरस (DAP)** और **पोटाश (MOP)** बुवाई के समय ही खेत में दें।
   - प्रति एकड़ 2-3 टन अच्छी सड़ी **गोबर की खाद** या केंचुआ खाद डालकर मिट्टी की उर्वरा शक्ति बढ़ाएं।

2. **टॉप ड्रेसिंग (खड़ी फसल में):**
   - **यूरिया (नाइट्रोजन)** को एक साथ न देकर सिंचाई के साथ 2-3 किस्तों में दें।
   - गेहूं में: पहली सिंचाई (21-25 दिन) के तुरंत बाद पहली यूरिया टॉप ड्रेसिंग करें।

3. **सूक्ष्म पोषक तत्वों की कमी:**
   - **जिंक की कमी (खैरा रोग / पत्तियां पीली पड़ना):** 0.5% जिंक सल्फेट + 0.25% बुझा चूना घोलकर छिड़कें।
   - **तिलहनी फसलों के लिए सल्फर (गंधक):** 20 किग्रा सल्फर प्रति एकड़ डालने से तेल की मात्रा 2.5-3% बढ़ती है।

*💡 टिप: अपनी एकड़ के अनुसार सटीक बोरियों की संख्या जानने के लिए हमारे **मिट्टी उर्वरक कैलकुलेटर** का उपयोग करें!*`,

    rice: `🌾 **धान (चावल) की खेती के लिए सर्वोत्तम मौसम:**

भारत में धान मुख्य रूप से तीन मौसमों में उगाया जाता है:

1. **खरीफ (अमन / मुख्य मौसम) — [सर्वाधिक लोकप्रिय]:**
   - **नर्सरी बुवाई:** मई से जून।
   - **रोपाई:** जून से जुलाई (दक्षिण-पश्चिम मानसून के साथ)।
   - **कटाई:** नवंबर से दिसंबर।
   - **प्रमुख किस्में:** *पूसा बासमती 1121, पूसा 1509, सांबा महसूरी, स्वर्णा, IR-64*.

2. **रबी (बोरो धान):**
   - पूर्वी और दक्षिणी राज्यों (पश्चिम बंगाल, ओडिशा, असम, आंध्र प्रदेश, तमिलनाडु) में उगाया जाता है।
   - **बुवाई:** नवंबर से दिसंबर; **कटाई:** अप्रैल से मई।

3. **जायद (गर्मी का धान):**
   - सुनिश्चित सिंचाई वाले क्षेत्रों में मार्च-अप्रैल में रोपाई और जून-जुलाई में कटाई।

4. **महत्वपूर्ण सुझाव:** कल्ले फूटते समय केवल 2-3 सेमी पानी रखें। एडब्ल्यूडी (AWD) पद्धति अपनाकर 25% ट्यूबवेल बिजली और पानी बचाएं।`,

    weather: `🌦️ **मौसम व कृषि मार्गदर्शन:**
वर्तमान मौसम और 5-दिवसीय बारिश पूर्वानुमान के लिए हमारे **[मौसम पृष्ठ](#weather)** पर जाएं। यह आपके जिले के लिए छिड़काव सुरक्षा, नमी और हवा की गति की वास्तविक जानकारी देता है।`,

    scheme: `🏛️ **किसान कल्याण सरकारी योजनाएं:**
1. **पीएम-किसान सम्मान निधि:** किसानों के बैंक खातों में प्रति वर्ष ₹6,000 (₹2,000 की 3 किस्तें)।
2. **प्रधानमंत्री फसल बीमा योजना (PMFBY):** प्राकृतिक आपदाओं से फसल नुकसान पर सुरक्षा (खरीफ 2%, रबी 1.5% प्रीमियम)।
3. **सोलर पंप सब्सिडी (PM-KUSUM):** सिंचाई के लिए सौर पंप स्थापना पर भारी अनुदान।
आधिकारिक जानकारी के लिए टोल-फ्री किसान कॉल सेंटर **1800-180-1551** पर संपर्क करें।`,

    mandi: `📊 **लाइव मंडी भाव:**
आज के औसत एपीएमसी मंडी भाव:
- **गेहूं (शरबती):** ₹2,680 / क्विंटल
- **बासमती धान:** ₹4,150 / क्विंटल
- **सोयाबीन:** ₹4,820 / क्विंटल
- **कपास:** ₹7,420 / क्विंटल
पूरा विवरण देखने के लिए होमपेज पर मंडी भाव सेक्शन देखें!`,

    fallback: (query) => `🙏 **नमस्ते किसान भाई!**
आपके प्रश्न: *"${query}"* के लिए धन्यवाद।

हमारी कृषि सलाह:
- नमी और कीटों की निगरानी के लिए हर 3-4 दिन में खेत का मुआयना करें।
- हर 2 साल में अपने नजदीकी केंद्र से मृदा स्वास्थ्य कार्ड (Soil Health Card) बनवाएं।
- रोग के तत्काल समाधान के लिए पत्ती की फोटो **[रोग पहचान पृष्ठ](#disease-detection)** पर अपलोड करें या राष्ट्रीय किसान कॉल सेंटर **1800-180-1551** (टोल-फ्री) पर संपर्क करें।

*त्वरित उत्तर के लिए ऊपर दिए गए सुझाए गए प्रश्नों पर भी क्लिक कर सकते हैं!*`
  }
};

/**
 * Match user query against agronomy dataset in current language
 */
function matchAgronomyResponse(query, lang = 'kn') {
  const currentLang = ['kn', 'en', 'hi'].includes(lang) ? lang : 'kn';
  const responses = PREDEFINED_RESPONSES[currentLang] || PREDEFINED_RESPONSES.kn;
  const clean = query.trim().toLowerCase().replace(/[?!.,]/g, '');

  // 1. Crop recommendation matching
  if (
    clean.includes('crop') ||
    clean.includes('grow') ||
    clean.includes('ಬೆಳೆ') ||
    clean.includes('ಬೆಳೆಯ') ||
    clean.includes('फसल') ||
    clean.includes('उगानी') ||
    clean.includes('बोएं')
  ) {
    return responses.crop;
  }

  // 2. Disease control matching
  if (
    clean.includes('disease') ||
    clean.includes('pest') ||
    clean.includes('fungus') ||
    clean.includes('rust') ||
    clean.includes('blight') ||
    clean.includes('ರೋಗ') ||
    clean.includes('ಕೀಟ') ||
    clean.includes('ನಿಯಂತ್ರ') ||
    clean.includes('रोग') ||
    clean.includes('कीट') ||
    clean.includes('नियंत्र')
  ) {
    return responses.disease;
  }

  // 3. Water / Irrigation matching
  if (
    clean.includes('water') ||
    clean.includes('irrigation') ||
    clean.includes('irrigate') ||
    clean.includes('ನೀರು') ||
    clean.includes('ನೀರಾವರಿ') ||
    clean.includes('ಹಾಯಿಸ') ||
    clean.includes('पानी') ||
    clean.includes('सिंचाई')
  ) {
    return responses.water;
  }

  // 4. Fertilizer matching
  if (
    clean.includes('fertilizer') ||
    clean.includes('urea') ||
    clean.includes('dap') ||
    clean.includes('npk') ||
    clean.includes('ಗೊಬ್ಬರ') ||
    clean.includes('ಯೂರಿಯಾ') ||
    clean.includes('ಪೋಷಕಾಂಶ') ||
    clean.includes('उर्वरक') ||
    clean.includes('खाद') ||
    clean.includes('यूरिया')
  ) {
    return responses.fertilizer;
  }

  // 5. Rice / Paddy matching
  if (
    clean.includes('rice') ||
    clean.includes('paddy') ||
    clean.includes('season') ||
    clean.includes('ಭತ್ತ') ||
    clean.includes('ಋತು') ||
    clean.includes('ಹಂಗಾಮು') ||
    clean.includes('चावल') ||
    clean.includes('धान') ||
    clean.includes('मौसम')
  ) {
    return responses.rice;
  }

  // Weather guidance
  if (
    clean.includes('weather') ||
    clean.includes('rain') ||
    clean.includes('spray') ||
    clean.includes('ಹವಾಮಾನ') ||
    clean.includes('ಮಳೆ') ||
    clean.includes('ಸಿಂಪಡಣೆ') ||
    clean.includes('मौसम') ||
    clean.includes('बारिश') ||
    clean.includes('छिड़काव')
  ) {
    return responses.weather;
  }

  // Govt schemes
  if (
    clean.includes('scheme') ||
    clean.includes('subsidy') ||
    clean.includes('kisan') ||
    clean.includes('ಯೋಜನೆ') ||
    clean.includes('ಸಬ್ಸಿಡಿ') ||
    clean.includes('योजना') ||
    clean.includes('सब्सिडी')
  ) {
    return responses.scheme;
  }

  // Mandi / prices
  if (
    clean.includes('mandi') ||
    clean.includes('price') ||
    clean.includes('rate') ||
    clean.includes('ಮಂಡಿ') ||
    clean.includes('ದರ') ||
    clean.includes('ಬೆಲೆ') ||
    clean.includes('मंडी') ||
    clean.includes('भाव') ||
    clean.includes('दाम')
  ) {
    return responses.mandi;
  }

  // Fallback
  return responses.fallback(query);
}

/**
 * Send chat message to assistant service.
 * Simulates asynchronous network latency, fully ready for future AI API integration.
 */
export async function sendChatMessage(userMessage, chatHistory = [], currentLanguage = 'kn') {
  // Predefined demo responses with realistic simulated typing latency (600ms - 900ms)
  return new Promise((resolve) => {
    const delay = Math.floor(650 + Math.random() * 300);
    setTimeout(() => {
      // Determine language from parameter or localStorage fallback
      let lang = currentLanguage;
      if (!lang) {
        try {
          lang = localStorage.getItem('krishimitra_language') || 'kn';
        } catch (e) {
          lang = 'kn';
        }
      }

      const responseText = matchAgronomyResponse(userMessage, lang);
      resolve({
        text: responseText,
        success: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, delay);
  });
}
