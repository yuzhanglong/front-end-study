---
date: 2021-3-21

tags:

- 前端基础
- 计算机网络

---

# 前端计算机网络必知必会 -- 应用层

[[toc]]

## DNS -- 域名系统

### 概念

DNS 解析其实就是用你的域名来定位真正的 IP 地址，就像拜访朋友要先知道别人家怎么走一样，Internet 上当一台主机要访问另外一台主机时，必须首先获知其地址，TCP/IP 中的 IP
地址是由四段以“.”分开的数字组成，记起来总是不如名字那么方便，所以，就采用了**DNS**来管理名字和 IP 的对应关系。

### 流程

DNS 解析本质上是一个**迭代查询**和**递归查询**的过程，假设我的主机要访问`docs.yuzzl.top`这个网站，需要获得它的 IP，来看看这个 DNS 解析流程：
![](http://cdn.yuzzl.top/blog/20201108194011.png)

### DNS 缓存

当某 DNS 服务器接收到一个应答之后，它会将这个内容缓存到服务器上。还是上面的图，假如另一台电脑使用同样的本地 DNS 服务器访问`docs.yuzzl.top`，那么本地 DNS
服务器查询缓存，然后直接返回`docs.yuzzl.top`的 IP 地址（如果没有过期的话）。

## HTTP

### 常见请求方法

**OPTIONS**

HTTP 的 OPTIONS 方法用于获取目的资源所支持的通信选项，其用法有二种：

- 检测服务器所支持的请求方法

![](http://cdn.yuzzl.top/blog/20210321193708.png)

- CORS 中的预检请求

CORS 通过一种叫**预检请求**（preflighted request）的服务器验证机制，允许使用自定义头部、除 GET 、POST、HEAD（这三个也被称为**简单请求**）
之外的方法，以及不同请求体内容类型。在要发送涉及上述某种高级选项的请求时，会先向服务器发送一个“预检”请求。这个请求使用 OPTIONS 方法发送并包含以下头部：

- **Origin**：与简单请求相同

- **Access-Control-Request-Method**：请求希望使用的方法

- **Access-Control-Request-Headers**：（可选）要使用的逗号分隔的自定义头部列表。

例如下面的请求报文(省略了一部分无关头部)：

```http request
OPTIONS /user/user_info HTTP/1.1
Host: 47.106.202.255:8081
Connection: keep-alive
Accept: */*
Access-Control-Request-Method: GET
Access-Control-Request-Headers: authorization,loading
Origin: http://yuzzl.top
```

在这个请求发送之后，服务器确认是否允许，然后在响应头部附带以下内容：

- **Access-Control-Allow-Origin**：支持请求的路径。
- **Access-Control-Allow-Methods**：允许的方法（逗号分隔的列表）。
- **Access-Control-Allow-Headers**：服务器允许的头部（逗号分隔的列表）。
- **Access-Control-Max-Age**：缓存预检请求的秒数 (预检请求也是有缓存机制的)。

例如下面的响应报文：

```http request
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: authorization, loading
Access-Control-Allow-Methods: POST,GET,PUT,OPTIONS,DELETE
Access-Control-Allow-Origin: http://docs.yuzzl.top
Access-Control-Max-Age: 3600
```

### 状态码



