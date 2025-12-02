import LVLLogo from "/images/LVLUP-logo.png";
import MiraiLogo from "/images/Mirai-logo.png";

export const logo = (name: string) => {
  switch (name.toLowerCase()) {
    case "host":
      return LVLLogo;
    case "mirai":
      return MiraiLogo;

    default:
      break;
  }
};
