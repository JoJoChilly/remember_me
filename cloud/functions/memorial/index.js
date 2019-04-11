const cloud = require('wx-server-sdk');
const cloudEnv = 'dev-724ae4';

cloud.init({
    env: cloudEnv,
});
const db = cloud.database({
    env: cloudEnv,
});

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext();
    const memorialsCollection = db.collection('memorials');

    switch (event.method) {
        case 'create':
            const data = {
                ...event.body,
                openId: wxContext.OPENID,
                created_at: new Date(),
                updated_at: new Date(),
            };
            const id = await memorialsCollection.add({
                data,
            });
            return {
                id,
                ...data,
            };
        case 'list':
            const openId = wxContext.OPENID;
            return await memorialsCollection
                .where({
                    openId,
                })
                .get();
        case 'update':
            const updateData = {
                ...event.body,
                openId: wxContext.OPENID,
                updated_at: new Date(),
            };
            delete updateData._id;
            return await memorialsCollection
                .where({
                    _id: event.body._id,
                })
                .update({
                    data: updateData,
                });
        case 'delete':
            try {
                return await memorialsCollection
                    .where({
                        _id: event.body.id,
                    })
                    .remove();
            } catch (e) {
                console.error(e);
            }
    }

    return 'failed';
};
