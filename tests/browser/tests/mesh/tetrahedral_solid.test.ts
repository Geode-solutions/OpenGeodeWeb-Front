// Local imports
import { loadTestDatas } from "@ogw_tests/browser/shim/load";
import { registerTests } from "@ogw_tests/browser/suites/mesh/tetrahedral_solid";
import { test } from "@ogw_tests/browser/shim/fixtures";

registerTests({ test, loadTestDatas });
