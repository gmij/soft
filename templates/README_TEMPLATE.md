# Readme 模板 / Readme Template

本模板帮助您为上传的软件创建中英文说明文档。

This template helps you create Chinese and English documentation for uploaded software.

---

## 使用方法 / How to Use

1. **复制模板文件到您的软件目录 / Copy template files to your software directory**
   - 将 `readme.zh-CN.md.example` 复制为 `readme.md`（或 `readme.zh-CN.md`）
   - 将 `readme.en.md.example` 复制为 `readme.en.md`
   - Copy `readme.zh-CN.md.example` as `readme.md` (or `readme.zh-CN.md`)
   - Copy `readme.en.md.example` as `readme.en.md`

2. **填写内容 / Fill in the content**
   - 根据模板提示，填写软件的相关信息
   - Fill in the software information according to the template prompts

3. **文件命名规则 / File Naming Rules**

   | 文件名 / Filename | 语言 / Language | 说明 / Description |
   |-------------------|-----------------|---------------------|
   | `readme.md` | 中文（默认）/ Chinese (default) | 中文描述，作为默认语言 |
   | `readme.zh-CN.md` | 中文 / Chinese | 中文描述（等同于 readme.md）|
   | `readme.en.md` | 英文 / English | 英文描述 |

4. **目录结构示例 / Directory Structure Example**

   ```
   down/
   └── 我的软件 (MySoftware)/
       ├── readme.md           # 中文描述（软件级别）
       ├── readme.en.md        # 英文描述（软件级别）
       ├── tags.txt            # 分类标签
       └── v1.0.0/
           ├── readme.md       # 中文版本说明（版本级别，可选）
           ├── readme.en.md    # 英文版本说明（版本级别，可选）
           └── myfile.zip      # 下载文件
   ```

---

## 模板文件 / Template Files

请查看以下模板文件：
Please check the following template files:

- [中文模板 / Chinese Template](./readme.zh-CN.md.example)
- [英文模板 / English Template](./readme.en.md.example)
