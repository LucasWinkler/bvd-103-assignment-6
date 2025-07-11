import { BodyProp, Controller, Get, Path, Post, Put, Route, SuccessResponse, Request } from 'tsoa'
import { type OrderId, type FulfilledBooks, type OrderPlacement, type Order } from '../documented_types'
import { fulfilOrder } from '../services/fulfil_order'
import { placeOrder } from '../services/place_order'
import { listOrders } from '../services/list_orders'
import { type ParameterizedContext, type DefaultContext, type Request as KoaRequest } from 'koa'
import { type AppWarehouseDatabaseState } from '../data/orders_database'

@Route('order')
export class OrderRoutes extends Controller {
  /**
     * Fulfil an order by taking all the relevant book copies for the order off the shelves
     * @param order The Order ID
     * @param booksFulfilled An array lsting how many copies of each book were taken from each shelf
     */
  @Put('{order}')
  @SuccessResponse(201, 'Fulfilled')
  public async fulfilOrder (
    @Path() order: OrderId,
      @BodyProp('booksFulfilled') booksFulfilled: FulfilledBooks,
      @Request() request: KoaRequest
  ): Promise<void> {
    const ctx: ParameterizedContext<AppWarehouseDatabaseState, DefaultContext> = request.ctx
    this.setStatus(201)
    try {
      await fulfilOrder(ctx.state.orders, order, booksFulfilled)
      this.setStatus(201)
    } catch (e) {
      this.setStatus(500)
      console.error('Error Fulfilling Order', e)
    }
  }

  /**
     * Place an order
     * @param order An array of the ordered book id's
     * @returns {OrderId}
     */
  @Post()
  @SuccessResponse(201, 'created')
  public async placeOrder (
    @BodyProp('order') order: OrderPlacement,
      @Request() request: KoaRequest
  ): Promise<OrderId> {
    const ctx: ParameterizedContext<AppWarehouseDatabaseState, DefaultContext> = request.ctx
    this.setStatus(201)
    try {
      const result = await placeOrder(ctx.state.orders, order)
      return result
    } catch (e) {
      this.setStatus(500)
      return ''
    }
  }

  /**
   * Get all the pending orders
   * @returns {Order[]}
   */
  @Get()
  public async listOrders (
    @Request() request: KoaRequest): Promise<Order[]> {
    const ctx: ParameterizedContext<AppWarehouseDatabaseState, DefaultContext> = request.ctx
    return await listOrders(ctx.state.orders)
  }
}
