# AI vs Real — video clips

Put the video files for the "AI vs Real" game in this folder.

1. Drop your clips here, e.g. `clip1.mp4`, `clip2.mp4`, ... (MP4 / H.264 works best across browsers).
2. Register each clip in `components/games/AIvsReal.tsx` inside the `rounds` array:

   ```ts
   export const rounds: Round[] = [
     { src: "/videos/ai-vs-real/clip1.mp4", isAI: true },
     { src: "/videos/ai-vs-real/clip2.mp4", isAI: false },
     // ...add at least 8
   ];
   ```

   - `src`  — path starting with `/videos/ai-vs-real/` (this folder). A full `https://` URL also works.
   - `isAI` — `true` if the clip is AI-generated, `false` if it's real footage.

The game shows 8 clips per play (picked at random if you add more) and the player
needs 6 correct to win.
