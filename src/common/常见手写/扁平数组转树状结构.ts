interface TreeItem {
  id: number;
  parentId: number;
  text: string;
  children?: TreeItem[];
}

const insertNodeIntoTree = (tree: TreeItem[], node: TreeItem) => {
  if (node.parentId === 0) {
    tree.push(node);
  } else {
    for (let treeItem of tree) {
      if (!treeItem.children) {
        treeItem.children = [];
      }

      if (treeItem.id === node.parentId) {
        treeItem.children.push(node);
      } else {
        insertNodeIntoTree(treeItem.children, node);
      }
    }
  }
};

const arrayToTree = (array: TreeItem[]) => {
  array.sort((a, b) => {
    return a.parentId - b.parentId;
  });

  const res: TreeItem[] = [];

  for (let treeItem of array) {
    insertNodeIntoTree(res, treeItem);
  }

  return res;
};

const data = [
  { id: 10, parentId: 0, text: '一级菜单-1' },
  { id: 20, parentId: 0, text: '一级菜单-2' },
  { id: 30, parentId: 20, text: '二级菜单-3' },
  { id: 25, parentId: 30, text: '三级菜单-25' },
  { id: 35, parentId: 30, text: '三级菜单-35' },
];

console.log(arrayToTree(data));
