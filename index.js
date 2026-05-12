require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');

let chatsThemes = {};

// Буфер для медиа-групп (альбомов) с динамическим ожиданием
const mediaGroupBuffer = {};

// Хранилище: message_id отправленного в чат правления сообщения -> userId отправителя
const sentMessageToUser = {};

// Структура: хранение состояния диалога пользователя
const userDialogs = {};

const govChatIdArr = [-4145453133, -4168599904, -4187356699, -4101563856, -4108240137, -4118911246, -4136291809, -4753833428, -1001468988358_896, -1001468988358];

const themesDatas = [
    { name: 'water', buttonName: 'Вода', targetChatId: -4145453133 },
    { name: 'electricity', buttonName: 'Электричество', targetChatId: -4168599904 },
    { name: 'roads', buttonName: 'Дороги', targetChatId: -4187356699 },
    { name: 'gas', buttonName: 'Газ', targetChatId: -4101563856 },
    { name: 'payment', buttonName: 'Оплата взносов', targetChatId: -4108240137 },
    { name: 'other', buttonName: 'Другой вопрос', targetChatId: -4118911246 },
    { name: 'riders', buttonName: 'Попутчики', targetChatId: -1001468988358_896 },
    { name: 'meeting', buttonName: 'К собранию', targetChatId: -4753833428 },
    { name: 'topresident', buttonName: 'Председателю', targetChatId: -4136291809 },
    { name: 'logs', buttonName: '', targetChatId: -1001801837649 }
];

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

const themeKeyboard = new InlineKeyboard()
    .text('Вода', 'water')
    .text('Электричество', 'electricity').row()
    .text('Дороги', 'roads')
    .text('Газ', 'gas').row()
    .text('Оплата взносов','payment')
    .text('Другой вопрос', 'other').row()
    .text('Председателю', 'topresident')
    .text('К собранию', 'meeting').row();

const themeKeyboardBack = new InlineKeyboard()
    .text('⬅️  Вернуться к списку тем', 'back');

const addOrSendKeyboard = new InlineKeyboard()
    .text('➕ Добавить', 'add_more')
    .text('✅ Отправить', 'send_appeal');

// Клавиатура для этапа "добавить ещё" – теперь с кнопкой "Отправить" и возвратом к выбору тем
const addMoreKeyboard = new InlineKeyboard()
    .text('✅ Отправить', 'send_appeal')
    .text('⬅️ Вернуться к выбору тем', 'back_to_theme');

const backToThemeKeyboard = new InlineKeyboard()
    .text('⬅️ Вернуться к выбору тем', 'back_to_theme');

// --------------- Команда запуска приема обращения
bot.command('start', async (ctx) => {
    let userChatId = ctx.update.message.chat.id;
    if (govChatIdArr.includes(userChatId)) {
        await ctx.reply('Извините, в данном чате функция /start недоступна');
    } else {
        await ctx.reply('Здравствуйте! Я бот-секретарь правления СНТ "Ключи-4 восточные". Через меня ваше сообщение отправится сразу к ответственному лицу. \n \n Выберите, пожалуйста, тему обращения', {
            reply_markup: themeKeyboard
        });
    }
});

// ----------------- Команда вызова кнопки со ссылкой
bot.command('bot_link', async (ctx) => {
    const inlineKeyboard2 = new InlineKeyboard().url('Приступить', 'http://t.me/univer_appeal_bot?start=start');
    await ctx.reply('--\nВы можете отправить обращение в правление через электронного секретаря.\n \nПросто нажмите "Приступить", когда будете готовы.', {
        reply_markup: inlineKeyboard2
    });
});

// --------------------- Кнопки выбора тем
async function startDialog(ctx, themeName, themeButtonName) {
    const userId = ctx.callbackQuery.from.id;
    if (userDialogs[userId]) delete userDialogs[userId];
    userDialogs[userId] = {
        step: 'waiting_plot_number',
        theme: themeName,
        plotNumber: null,
        name: null,
        messages: []   // только сообщения с описанием проблемы
    };
    await ctx.callbackQuery.message.editText(`✅ Вы выбрали тему обращения "${themeButtonName}".\n\nНапишите, пожалуйста, номер вашего участка в посёлке.`, {
        reply_markup: backToThemeKeyboard
    });
    await ctx.answerCallbackQuery();
}

bot.callbackQuery('water', async (ctx) => startDialog(ctx, 'water', 'Вода'));
bot.callbackQuery('electricity', async (ctx) => startDialog(ctx, 'electricity', 'Электричество'));
bot.callbackQuery('roads', async (ctx) => startDialog(ctx, 'roads', 'Дороги'));
bot.callbackQuery('gas', async (ctx) => startDialog(ctx, 'gas', 'Газ'));
bot.callbackQuery('payment', async (ctx) => startDialog(ctx, 'payment', 'Оплата взносов'));
bot.callbackQuery('other', async (ctx) => startDialog(ctx, 'other', 'Другой вопрос'));
bot.callbackQuery('topresident', async (ctx) => startDialog(ctx, 'topresident', 'Председателю'));
bot.callbackQuery('meeting', async (ctx) => startDialog(ctx, 'meeting', 'К собранию'));
bot.callbackQuery('riders', async (ctx) => startDialog(ctx, 'riders', 'Попутчики'));

// ---------------------- Кнопка возврата к выбору темы (из диалога)
bot.callbackQuery('back_to_theme', async (ctx) => {
    const userId = ctx.callbackQuery.from.id;
    if (userDialogs[userId]) delete userDialogs[userId];
    await ctx.callbackQuery.message.editText('Выберите, пожалуйста, тему обращения.', {
        reply_markup: themeKeyboard
    });
    await ctx.answerCallbackQuery();
});

// Кнопка "Добавить" — остаёмся в режиме сбора сообщений, но предлагаем клавиатуру с "Отправить"
bot.callbackQuery('add_more', async (ctx) => {
    const userId = ctx.callbackQuery.from.id;
    const dialog = userDialogs[userId];
    if (!dialog || dialog.step !== 'waiting_issue') {
        await ctx.answerCallbackQuery('Нет активного обращения. Начните заново через /start');
        return;
    }
    await ctx.callbackQuery.message.editText('Хорошо, напишите ещё одно сообщение или нажмите "Отправить", если больше сообщений не требуется.', {
        reply_markup: addMoreKeyboard   // новая клавиатура
    });
    await ctx.answerCallbackQuery();
});

// Кнопка "Отправить" — финальная отправка всех накопленных данных
bot.callbackQuery('send_appeal', async (ctx) => {
    const userId = ctx.callbackQuery.from.id;
    const dialog = userDialogs[userId];
    if (!dialog || dialog.step !== 'waiting_issue') {
        await ctx.answerCallbackQuery('Нет активного обращения. Начните заново через /start');
        return;
    }

    const targetChatId = themesDatas.find(t => t.name === dialog.theme)?.targetChatId;
    const logsChatId = -1001801837649;
    if (!targetChatId) {
        await ctx.reply('Ошибка: тема не распознана. Начните заново.');
        delete userDialogs[userId];
        return;
    }

    // Функция пересылки одиночного сообщения
    const forwardSingle = async (msgObj, chatId, uid) => {
        try {
            const sent = await ctx.api.forwardMessage(chatId, msgObj.chat.id, msgObj.message_id);
            sentMessageToUser[sent.message_id] = uid;
        } catch (e) { console.error('Ошибка forward:', e); }
    };

    // Функция отправки альбома
    const sendGroup = async (groupMsgs, chatId, uid) => {
        try {
            const inputMediaArray = [];
            for (let i = 0; i < groupMsgs.length; i++) {
                const msg = groupMsgs[i];
                let type = null;
                let fileId = null;
                if (msg.photo) {
                    fileId = msg.photo[msg.photo.length-1].file_id;
                    type = 'photo';
                } else if (msg.video) {
                    fileId = msg.video.file_id;
                    type = 'video';
                } else continue;
                const media = { type, media: fileId };
                if (i === 0 && msg.caption) {
                    media.caption = msg.caption;
                    if (msg.caption_entities) media.caption_entities = msg.caption_entities;
                }
                inputMediaArray.push(media);
            }
            if (inputMediaArray.length === 0) return;
            const sent = await ctx.api.sendMediaGroup(chatId, inputMediaArray);
            sent.forEach(msg => { sentMessageToUser[msg.message_id] = uid; });
        } catch (e) { console.error('Ошибка sendMediaGroup:', e); }
    };

    // Функция отправки текстового сообщения
    const sendText = async (text, chatId, uid) => {
        try {
            const sent = await ctx.api.sendMessage(chatId, text);
            sentMessageToUser[sent.message_id] = uid;
        } catch (e) { console.error('Ошибка отправки текста:', e); }
    };

    // Отправляем вступительное сообщение
    const introText = `В правление обращается ${dialog.name} с участка ${dialog.plotNumber}`;
    await sendText(introText, targetChatId, userId);
    await sendText(introText, logsChatId, userId);

    // Пересылаем только сообщения с проблемой
    for (const item of dialog.messages) {
        if (Array.isArray(item)) {
            await sendGroup(item, targetChatId, userId);
            await sendGroup(item, logsChatId, userId);
        } else {
            await forwardSingle(item, targetChatId, userId);
            await forwardSingle(item, logsChatId, userId);
        }
    }

    await ctx.callbackQuery.message.editText('Ваше обращение перенаправлено ответственному лицу.\n \nСпасибо, что доверили это мне 😊');
    await ctx.answerCallbackQuery();
    delete userDialogs[userId];
});

// ---------------------- Кнопка "назад" (старая, для совместимости)
bot.callbackQuery('back', async (ctx) => {
    const userId = ctx.callbackQuery.from.id;
    if (userDialogs[userId]) delete userDialogs[userId];
    await ctx.callbackQuery.message.editText('Выберите, пожалуйста, тему обращения.', {
        reply_markup: themeKeyboard
    });
    await ctx.answerCallbackQuery();
});

// ------------------- Обработка сообщений от пользователя
bot.on('message', async (ctx) => {
    const userChatId = ctx.update.message.chat.id;
    const userId = ctx.update.message.from.id;

    // --- Ответы из чатов правления ---
    if (govChatIdArr.includes(userChatId) && ctx.update.message.reply_to_message) {
        const repliedMsgId = ctx.update.message.reply_to_message.message_id;
        const originalUserId = sentMessageToUser[repliedMsgId];
        if (originalUserId) {
            await bot.api.sendMessage(originalUserId, 'Доброго времени суток. \n \nВам отправлен официальный ответ на ранее оставленное обращение.\n \nМожете ознакомиться с ним ниже');
            await ctx.forwardMessage(originalUserId);
        }
        return;
    }
    if (govChatIdArr.includes(userChatId)) return;

    const dialog = userDialogs[userId];
    if (!dialog) {
        await ctx.reply('Извините, но вы не указали тему обращения. Давайте начнем сначала. Нажмите /start');
        return;
    }

    // ---- Вспомогательная функция для добавления сообщения в диалог (только для проблемы) ----
    const addToDialogIssue = async (msgObj) => {
        const mediaGroupId = msgObj.media_group_id;
        if (!mediaGroupId) {
            dialog.messages.push(msgObj);
            await ctx.reply('Отправить обращение правлению или хотите добавить ещё одно сообщение?', { reply_markup: addOrSendKeyboard });
            return;
        }
        const bufferKey = `${mediaGroupId}_${userId}`;
        if (!mediaGroupBuffer[bufferKey]) {
            mediaGroupBuffer[bufferKey] = { messages: [], timer: null };
        }
        const buf = mediaGroupBuffer[bufferKey];
        buf.messages.push(msgObj);
        if (buf.timer) clearTimeout(buf.timer);
        buf.timer = setTimeout(() => {
            buf.messages.sort((a,b) => a.message_id - b.message_id);
            dialog.messages.push(buf.messages);
            delete mediaGroupBuffer[bufferKey];
            ctx.reply('Отправить обращение правлению или хотите добавить ещё одно сообщение?', { reply_markup: addOrSendKeyboard }).catch(console.error);
        }, 2000);
    };

    // Этап 1: номер участка
    if (dialog.step === 'waiting_plot_number') {
        const plotNumber = ctx.update.message.text;
        if (!plotNumber) {
            await ctx.reply('Пожалуйста, отправьте номер участка текстовым сообщением.', { reply_markup: backToThemeKeyboard });
            return;
        }
        dialog.plotNumber = plotNumber;
        dialog.step = 'waiting_name';
        await ctx.reply('Представьтесь, пожалуйста (как к вам можно обращаться?).', { reply_markup: backToThemeKeyboard });
        return;
    }

    // Этап 2: имя
    if (dialog.step === 'waiting_name') {
        const name = ctx.update.message.text;
        if (!name) {
            await ctx.reply('Пожалуйста, напишите ваше имя текстовым сообщением.', { reply_markup: backToThemeKeyboard });
            return;
        }
        dialog.name = name;
        dialog.step = 'waiting_issue';
        await ctx.reply('Пожалуйста, опишите проблему или вопрос. Допускается прикреплять фото, видео, геопозицию и файлы.', {
            reply_markup: backToThemeKeyboard
        });
        return;
    }

    // Этап 3: сбор сообщений обращения
    if (dialog.step === 'waiting_issue') {
        await addToDialogIssue(ctx.msg);
        return;
    }

    await ctx.reply('Что-то пошло не так. Попробуйте начать заново через /start');
});

// ------------------ Установка команд в меню
(async () => {
    try {
        await bot.api.setMyCommands([
            { command: 'start', description: 'Подать обращение в правление' }
        ]);
        console.log('Команды бота установлены');
    } catch (err) {
        console.error('Не удалось установить команды (бот продолжит работу):', err.message);
    }
})();

// ------------------ Перехват ошибок
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.log("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.log("Could not contact Telegram:", e);
    } else {
        console.log("Unknown error:", e);
    }
});

bot.start().catch((err) => {
    console.error('Бот не смог подключиться к Telegram API:', err.message);
    process.exitCode = 1;
});