// 优雅地实现字符串拼接


const authorize = (user, action) => {
  // 传统写法为
  // 'User '
  // + user.name
  // + ' is not authorized to do '
  // + action
  // + '.'
  return `User ${user.name} is not authorized to do ${action}.`;
}

console.log(authorize("yzl", "play"));

/////////////////////////////////////////////////////////////////////////////

// 模板编译
let template = `
<ul>
  <% for(let i=0; i < data.supplies.length; i++) { %>
    <li><%= data.supplies[i] %></li>
  <% } %>
</ul>
`;


const compile = (template) => {
  let evalExpr = /<%=(.+?)%>/g;
  let expr = /<%([\s\S]+?)%>/g;

  template = template
    .replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`')
    .replace(expr, '`); \n $1 \n  echo(`');

  template = 'echo(`' + template + '`);';

  const getScript = () => {
    return `(function parse(data){
      let output = "";
      function echo(html){
        output += html;
      }
      ${template}
      return output;
    })`;
  }
  return getScript();
}


let parser = eval(compile(template));

console.log(parser({supplies: ["broom", "mop", "cleaner"]}));


/////////////////////////////////////////////////////////////////////////////

// 标签模板
const tag = (stringArr, ...values) => {
  // ...
  let cnt = 0;
  return values.reduce((pre, cur) => {
    return stringArr[cnt++] + pre + cur + stringArr[cnt];
  }, "");
}

console.log(tag`The total is ${30} (${30 * 1.05} with tax)`);

// 这会报错
// console.log(`bad escape sequence: \unicode`);

// 对于标签模板 js引擎放松了对字符串转义的限制
const myTag = (strs) => {
  console.log(strs[0] === undefined);
  console.log(strs.raw[0] === "\\unicode and \\u{55}");
  return "OK";
}

console.log(myTag`\unicode and \u{55}`);
