import { blankScreen } from "./lib/blankScreen";
import { injectJsError } from "./lib/jsError";
import { timing } from "./lib/timing";
import injectXHR from "./lib/xhr";

injectJsError();
injectXHR();
blankScreen();
timing();
