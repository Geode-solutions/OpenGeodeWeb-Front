// Local imports
import { loadTestDatas } from "@ogw_tests/browser/shim/load";
import { registerTests } from "@ogw_tests/browser/suites/image/raster_image";
import { test } from "@ogw_tests/browser/shim/fixtures";

registerTests({ test, loadTestDatas });
