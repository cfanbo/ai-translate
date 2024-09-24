# 定义默认的目标
.PHONY: all
all: package publish

# 打包命令
.PHONY: package
package:
	vsce package

# 发布命令
.PHONY: publish
publish:
	vsce publish

