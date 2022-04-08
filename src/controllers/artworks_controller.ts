import { Context, Status, helpers, Document } from "../deps.ts";
import { Artwork } from "../models/artworks.ts";

enum Order {
  Asc = 1,
  Desc = -1,
}

export const artworkController = {
  /**
   * GitHubへリダイレクト
   * @param context コンテキスト
   */
  redirect(context: Context) {
    context.response.redirect("https://github.com/arrow2nd/imas-artwork-api");
  },

  /**
   * /v1/cd/:id
   * @param context コンテキスト
   */
  async get(context: Context) {
    const { id } = helpers.getQuery(context, { mergeParams: true });
    const artwork = await Artwork.findById(id);

    // IDが存在しない
    if (!artwork) {
      context.response.status = Status.NotFound;
    }

    context.response.body = artwork || { message: "Not Found" };
  },

  /**
   * /v1/list
   * @param context コンテキスト
   */
  async search(context: Context) {
    const { keyword, order, orderby, limit } = helpers.getQuery(context);

    // console.log(`keyword = '${keyword}'`);

    // キーワードが無い
    if (!keyword) {
      context.response.status = Status.BadRequest;
      context.response.body = { message: "Invalid parameter" };
      return;
    }

    // ソート順
    const orderNum = order === "desc" ? Order.Desc : Order.Asc;

    // ソート基準
    const sorts: Map<string, Document> = new Map([
      ["id", { _id: orderNum }],
      ["title", { title: orderNum }],
    ]);

    const artworks = await Artwork.findByKeyword({
      keyword,
      sort: sorts.get(orderby),
      limit: limit ? parseInt(limit) : undefined,
    });

    context.response.body = artworks;
  },
};