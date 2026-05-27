export class DangerousBackend {
  constructor() {
    throw new Error(
      'Server backend mode is unavailable in the local reduced build.',
    )
  }
}
