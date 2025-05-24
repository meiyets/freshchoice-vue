let icons = [];
// 修改 import.meta.glob 以包含多个目录
const modules = import.meta.glob([
  "./../../assets/icons/svg/*.svg",
  "./../../assets/icons/my_svg/*.svg", // 添加您的新目录
]);

for (const path in modules) {
  // 调整路径处理逻辑，以正确提取不同目录下的图标名称
  const p = path.split("/").pop().split(".svg")[0];
  icons.push(p);
}

export default icons;
