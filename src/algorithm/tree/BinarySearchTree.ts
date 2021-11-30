import { TreeNode } from '../common/treeNode'
import { Comparator } from '../common/public'

class BinarySearchTree<E> {
  private root: TreeNode<E>
  private comparator: Comparator<E>

  public add(element: E, target: TreeNode<E>) {
    // 插入根节点
    if (this.root === null || this.root === undefined) {
      this.root = new TreeNode<E>(element, null, null)
      return
    }
    // TODO: 比较器
    // @ts-ignore
    // 关键字等于e.key的数据元素，不处理
    if (element === this.root.left) {
      return
    }

    if (element < this.root.element) {
      this.add(element, this.root.left)
    } else {
      this.add(element, this.root.right)
    }
  }

  public remove(element: E, target: TreeNode<E>) {
    if (element === this.root.element) {
    }
  }

  private removeNode(target: TreeNode<E>) {}
}
