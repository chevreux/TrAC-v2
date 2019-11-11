import ms from "ms";

export const SECRET =
  process.env.SECRET ??
  (() => {
    console.warn('Please use the "SECRET" environment variable!');
    return "Vzu93jvOF8huLwqw1u2JOZN1FYc5MRbxQgbKgId";
  })();
export const ONE_DAY = ms("1 day");
export const THIRTY_MINUTES = ms("30 mins");
