import { FreeStuffApi } from 'freestuff';

const API_TOKEN_ENV = process.env.FREESTUFF_API_TOKEN;
if (!API_TOKEN_ENV) throw new Error('The FREESTUFF_API_TOKEN has not been set!');
export const API_TOKEN = API_TOKEN_ENV;

const IS_PARTNER = !!process.env.FREESTUFF_API_PARTNER;

export const api = new FreeStuffApi({
    type: IS_PARTNER ? 'partner' : 'basic',
    key: API_TOKEN,
    sid: 'telegram',
    version: '2.0.0'
});
