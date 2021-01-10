import {combinationSum} from "../回溯-加起来和为目标值的组合";

describe('test 回溯-加起来和为目标值的组合', () => {
    test('test 测试样例1', () => {
        let res = combinationSum([100, 10, 20, 70, 60, 10, 50], 80)
        expect(res).toStrictEqual([[10, 10, 60], [10, 20, 50], [10, 70], [20, 60]]);
    });

    test('test 测试样例2', () => {
        let res = combinationSum([100, 10, 20], 30)
        expect(res).toStrictEqual([[10, 20]]);
    });
});

