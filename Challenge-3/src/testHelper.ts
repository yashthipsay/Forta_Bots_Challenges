import { MockProvider } from "./MockProvider";

export {MockProvider} from "./MockProvider";

export class TestHelper {
    static createL1Provider(chainId: number, l1Balance: string): MockProvider {
        return new MockProvider(chainId, l1Balance, "")
    }

    static createL2Provider(chainId: number, l2Supply: string): MockProvider {
        return new MockProvider(chainId, "", l2Supply);
    }
}
