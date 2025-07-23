import { Application, Id, NullableId, PaginationParams, Params, ServiceMethods } from '@feathersjs/feathers'

export class BaseService<Result, Data = Partial<Result>, ServiceParams = Params, PatchData = Partial<Data>>
  implements ServiceMethods<Result, Data, ServiceParams, PatchData>
{
  find(params?: (ServiceParams & { paginate?: PaginationParams | undefined }) | undefined): Promise<Result[]> {
    return Promise.resolve([{} as Result])
  }
  get(id: Id, params?: ServiceParams | undefined): Promise<Result> {
    return Promise.resolve({} as Result)
  }
  create(data: Data, params?: ServiceParams | undefined): Promise<Result> {
    return Promise.resolve({} as Result)
  }
  update(id: NullableId, data: Data, params?: ServiceParams | undefined): Promise<Result | Result[]> {
    return Promise.resolve({} as Result)
  }
  patch(id: NullableId, data: PatchData, params?: ServiceParams | undefined): Promise<Result | Result[]> {
    return Promise.resolve({} as Result)
  }
  remove(id: NullableId, params?: ServiceParams | undefined): Promise<Result | Result[]> {
    return Promise.resolve({} as Result)
  }
  setup?(app: Application<any, any>, path: string): Promise<void> {
    return Promise.resolve()
  }
  teardown?(app: Application<any, any>, path: string): Promise<void> {
    return Promise.resolve()
  }
}
