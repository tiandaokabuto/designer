 const iconv = require("iconv-lite");

export const getUTF8 = (binary) => {
  try {
    const bufferReader = Buffer.from(binary, "binary");
    const logGBK = iconv.decode(bufferReader, "cp936"); // gbk字符串
    const logBufferUtf8 = iconv.encode(logGBK, "utf8"); // utf8的buffer
    const logUtf8 = iconv.decode(logBufferUtf8, "utf8");
    return logUtf8;
  } catch {
    return "";
  }
};
