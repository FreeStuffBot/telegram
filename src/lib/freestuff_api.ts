import { FreeStuffApi } from 'freestuff';

const API_TOKEN = process.env.FREESTUFF_API_TOKEN;
if (!API_TOKEN) throw new Error('The FREESTUFF_API_TOKEN has not been set!');

const IS_PARTNER = !!process.env.FREESTUFF_API_PARTNER;

export const api = new FreeStuffApi({
    type: IS_PARTNER ? 'partner' : 'basic',
    key: API_TOKEN,
    sid: 'telegram',
    version: '2.0.0'
});
