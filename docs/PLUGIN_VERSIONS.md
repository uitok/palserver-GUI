# 插件版本配置

此文件记录 palserver-GUI 使用的插件版本信息。

## 当前版本

### UE4SS (Unreal Engine 4 Scripting System)
- **仓库**: https://github.com/UE4SS-RE/RE-UE4SS
- **当前版本**: 请运行 `npm run check-plugin-versions` 查看
- **最新版本检查**: https://github.com/UE4SS-RE/RE-UE4SS/releases/latest
- **兼容性**: Palworld 0.4.x+

### PalGuard / PalDefender
- **仓库**: 需要确认实际仓库地址
- **当前版本**: 请运行 `npm run check-plugin-versions` 查看
- **最新版本检查**: 需要确认
- **兼容性**: Palworld 0.4.x+

## 更新插件

### 自动更新（推荐）

```bash
npm run update-plugins
```

此命令会自动从 GitHub 下载最新版本的 UE4SS 和 PalGuard，并更新到 `assets/engine/server-template/` 目录。

### 手动更新

1. **UE4SS**:
   - 访问 https://github.com/UE4SS-RE/RE-UE4SS/releases/latest
   - 下载 `UE4SS_v*.zip`（非 zDEV 版本）
   - 解压到 `assets/engine/server-template/UE4SS/`
   - 创建 `ue4ss.version.txt` 文件，写入版本号（如 `3.0.1`）

2. **PalGuard**:
   - 访问 PalGuard 官方发布页
   - 下载最新版本
   - 解压到 `assets/engine/server-template/Palguard/`
   - 创建 `palguard.version.txt` 文件，写入版本号（如 `1.7.2`）

## 版本检查

运行以下命令检查当前安装的插件版本：

```bash
npm run check-plugin-versions
```

## 兼容性说明

- **UE4SS**: 确保使用与 Palworld 当前版本兼容的 UE4SS 版本
- **PalGuard**: 需要与 Palworld 服务器版本匹配
- 建议在 Palworld 大版本更新后，检查并更新插件

## 故障排除

### UE4SS 无法加载
1. 确认 `dwmapi.dll` 和 `UE4SS.dll` 在正确位置
2. 检查 `UE4SS-settings.ini` 配置
3. 查看 `UE4SS.log` 日志文件

### PalGuard 无法启动
1. 确认 `palguard.dll` 和配置文件存在
2. 检查 `palguard.json` 配置
3. 查看服务器日志

## 更新历史

| 日期 | UE4SS | PalGuard | 说明 |
|------|-------|----------|------|
| 2026-03-03 | - | - | 添加自动更新脚本 |

## 相关链接

- [UE4SS 文档](https://docs.ue4ss.com/)
- [Palworld 官方文档](https://tech.palworldgame.com/dedicated-server-guide)
- [palserver-GUI 文档](https://dalufishes-team.gitbook.io/palserver-gui)
