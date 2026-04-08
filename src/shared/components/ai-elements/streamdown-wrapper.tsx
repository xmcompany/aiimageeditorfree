"use client";

import { memo } from "react";
import { Streamdown as OriginalStreamdown } from "streamdown";

export default memo(function StreamdownWrapper(props: any) {
  return <OriginalStreamdown {...props} />;
});
