import {
  ConverterOptions,
  ConvertOptions,
  initialize,
  svg2png,
} from 'svg2png-wasm';
import wasm from './svg2png_wasm_bg.wasm';
import roboto from './Roboto-Thin.ttf';
import { svg as svgtemplate } from './template';

const getOptionsFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    const queryString = urlObject.search.slice(1).split('&');
    const params: Record<string, string> = {};
    queryString.forEach((item) => {
      const kv = item.split('=');
      if (kv[0]) params[kv[0]] = kv[1];
    });
    const armor = decodeURI(params.armor).split('%2C') || [];
    return { armor };
  } catch (e) {
    return { armor: [] };
  }
};

const handleRequest = async (req: Request): Promise<Response> => {
  try {
    const opt = getOptionsFromUrl(req.url);
    const svg = svgtemplate
      .replace('{head}', opt.armor[0])
      .replace('{shoulders}', opt.armor[1])
      .replace('{coat}', opt.armor[2])
      .replace('{gloves}', opt.armor[3])
      .replace('{leggings}', opt.armor[4])
      .replace('{shoes}', opt.armor[5]);

    await initialize(wasm).catch(() => {});
    const options: ConverterOptions & ConvertOptions = {
      fonts: await Promise.all([new Uint8Array(roboto)]),
      defaultFontFamily: {
        sansSerifFamily: 'Roboto',
        serifFamily: 'Roboto',
        cursiveFamily: 'Roboto',
        fantasyFamily: 'Roboto',
        monospaceFamily: 'Roboto',
      },
    };

    const buf = await svg2png(svg, options);
    return new Response(buf, { headers: { 'content-type': 'image/png' } });
  } catch (e) {
    return new Response(`${e}`, { status: 500 });
  }
};
export default { fetch: handleRequest };
