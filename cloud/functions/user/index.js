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
    const usersCollection = db.collection('users');
    switch (event.method) {
        case 'login':
            const users = await usersCollection
                .where({
                    openId: wxContext.OPENID, // 填入当前用户 openid
                })
                .get();
            if (users.data.length > 0) {
                return users.data[0];
            } else {
                return {};
            }
        case 'register':
            const user = {
                avatarUrl: event.body.avatarUrl,
                city: event.body.city,
                gender: event.body.gender,
                language: event.body.language,
                nickName: event.body.nickName,
                province: event.body.province,
                openId: wxContext.OPENID,
            };
            try {
                const users = await usersCollection
                    .where({
                        openId: wxContext.OPENID, // 填入当前用户 openid
                    })
                    .get();

                if (users.data.length > 0) {
                    await usersCollection
                        .where({
                            openId: wxContext.OPENID, // 填入当前用户 openid
                        })
                        .update({
                            data: {
                                ...user,
                                updated_at: new Date(),
                            },
                        });
                } else {
                    await usersCollection.add({
                        data: {
                            ...user,
                            created_at: new Date(),
                            updated_at: new Date(),
                        },
                    });
                }
                const userResult = await usersCollection
                    .where({
                        openId: wxContext.OPENID, // 填入当前用户 openid
                    })
                    .get();
                return userResult.data[0];
            } catch (e) {
                return e;
            }
    }
};
