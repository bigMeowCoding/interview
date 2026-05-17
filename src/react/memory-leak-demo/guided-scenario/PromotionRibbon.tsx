import { useEffect } from "react";
import {
  pushDetachedNode,
  registerLeakyListener,
  startLeakyInterval,
} from "../state";

/**
 * 业务里常见的「埋点 / 画布尺寸」组合拳：看起来像正常初始化，
 * 但若没在面板销毁时拆掉，就会把监听、计时器与被摘下的 DOM 节点留在堆里。
 *
 * ⚠️ 初学者引导场景：故意不写 teardown，答案请配合 Guided 分步文案阅读。
 */
function wirePromoSignalsForCampaign(_campaignId: string): void {
  const onResize = () => undefined;
  registerLeakyListener({
    target: window,
    type: "resize",
    handler: onResize,
  });
  startLeakyInterval(2000);

  const anchor = document.createElement("aside");
  anchor.dataset.promoCampaign = _campaignId;
  anchor.textContent = "telemetry-anchor";
  anchor.className = "leak-detached-node";
  document.body.appendChild(anchor);
  document.body.removeChild(anchor);
  pushDetachedNode(anchor);
}

interface PromotionRibbonProps {
  campaignId: string;
}

export function PromotionRibbon({ campaignId }: PromotionRibbonProps) {
  useEffect(() => {
    wirePromoSignalsForCampaign(campaignId);
    return undefined;
  }, [campaignId]);

  return (
    <aside
      className="promo-ribbon-strip"
      role="banner"
      aria-label="营销中心条幅"
    >
      <div className="promo-ribbon-inner">
        <span className="promo-badge">直播中</span>
        <strong>春季拉新专场</strong>
        <span className="promo-muted">活动 ID · {campaignId}</span>
        <button type="button" className="promo-cta" disabled>
          去了解
        </button>
      </div>
    </aside>
  );
}
