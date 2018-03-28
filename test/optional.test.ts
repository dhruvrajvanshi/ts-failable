/**
 * Tests for optional
 */
// tslint:disable-next-line
import { expect } from "chai";
import { Optional } from "../src/optional";
type T = {
  x?: {
    y?: {
      z?: {
        a?: string;
      };
    };
  };
};

describe("optional", () => {
  it ("short circuits on undefined value in path", () => {
    const t = Optional.of<T>({});

    expect(t.valueOf()).to.deep.equal({});
    expect(t.x.valueOf()).to.deep.equal(null);
    expect(t.x.y.valueOf()).to.deep.equal(null);
    expect(t.x.y.z.valueOf()).to.deep.equal(null);
    expect(t.x.y.z.a.valueOf()).to.equal(null);

    const t1 = Optional.of<T>({
      x: { y: { z: { a: undefined } } }
    });
    expect(t1.x.y.z.a.valueOf()).to.equal(null);
    const t2 = Optional.of<T>({
      x: { y: { z: { a: "asdf" } } }
    });
    expect(t2.x.y.z.a.valueOf()).to.equal("asdf");
  });
});
