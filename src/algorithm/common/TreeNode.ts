import {BaseNode} from "./public";

class TreeNode<E> implements BaseNode<E> {
  element: E;
  left: TreeNode<E>;
  right: TreeNode<E>;



  constructor(element: E, left: TreeNode<E>, right: TreeNode<E>) {
    this.element = element;
    this.left = left;
    this.right = right;
  }

  public isLeaf() {
    return this.left === null && this.right === null;
  }

  public hasTwoChildren() {
    return this.left != null && this.right != null;
  }
}


export {
  TreeNode
}
