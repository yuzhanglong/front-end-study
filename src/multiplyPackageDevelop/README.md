# 多包协作
 
需求：package1 中**不使用绝对 && 相对路径**引用本地package2

## cd 到 package1 目录
```
cd the/package1/path
```

## 执行 npm link(本质上是软链接)

```
npm link the/package2/path
```
