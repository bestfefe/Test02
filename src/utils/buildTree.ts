export const buildTree = (list:any[]) => {
    const tree:any[] = [];
    const map:Record<string, any> = {};
    list.forEach((item) => {
        map[item.id] = {
            key: item.id,
            title: item.categoryName,
            ...item,
            children: []
        };
    });

    list.forEach((item) => {
        const parent = map[item.parentId];
        if (parent) {
            parent.children.push(map[item.id]);
        } else {
            tree.push(map[item.id]);
        }
    });
    return tree;
};
