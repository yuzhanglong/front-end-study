function handleValue(val) {
    switch (val.type) {
        case 'foo':
            // 这里 val 被收窄为 Foo
            break;
        case 'bar':
            // val 在这里是 Bar
            break;
        default:
            // val 在这里是 never
            var exhaustiveCheck = val;
            break;
    }
}
