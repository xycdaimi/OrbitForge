const WORDS_PER_MINUTE = 200;
const CHINESE_CHARS_PER_MINUTE = 300;

export type ReadingTime = {
  minutes: number;
  words: number;
};

export function estimateReadingTime(content: string): ReadingTime {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-|[\](){}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const chineseChars = (plain.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latinWords = plain
    .replace(/[\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(
    1,
    Math.ceil(
      latinWords / WORDS_PER_MINUTE + chineseChars / CHINESE_CHARS_PER_MINUTE,
    ),
  );

  return {
    minutes,
    words: latinWords + chineseChars,
  };
}
