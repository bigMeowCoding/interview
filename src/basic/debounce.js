/**
 * 函数防抖是指在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时。
 * 这可以使用在一些点击请求的事件上，避免因为用户的多次点击向后端发送多次请求。
 *
 * @param fn - 需要防抖处理的回调函数
 * @param delay - 延迟时间（毫秒），默认 300ms
 * @param immediate - 是否立即执行（立即执行后，在 delay 期间内不会再执行）
 * @returns 包含以下属性的防抖函数对象：
 *   - originalFn: 原始回调函数
 *   - cancel: 取消当前等待执行的定时器
 *   - flush: 立即执行回调（取消等待中的定时器并立即执行）
 */
function debounce(fn, delay = 300, immediate = false) {
  // timerId 用于标识当前等待中的定时器
  let timerId = null;

  // lastArgs 记录最后一次调用时的参数，用于 flush 时调用
  let lastArgs = null;

  // lastThis 记录最后一次调用时的上下文（this）
  let lastThis = null;

  // 判断是否处于防抖等待期（即刚刚执行过 immediate 后的冷静期）
  let isInCoolingPeriod = false;

  /**
   * 防抖处理函数（返回给调用者使用的函数）
   * 支持传入参数和上下文
   */
  function debounced(...args) {
    // 记录本次调用的参数和上下文，供 flush 使用
    lastArgs = args;
    lastThis = this;

    // 清除之前的定时器（如果存在）
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }

    if (immediate && !isInCoolingPeriod) {
      // immediate 模式：立即执行回调
      fn.apply(lastThis, lastArgs);
      isInCoolingPeriod = true;

      // 设置冷静期，冷静期结束后重置标志
      timerId = setTimeout(() => {
        isInCoolingPeriod = false;
        timerId = null;
      }, delay);
    } else if (!immediate) {
      // 普通模式：延迟 delay 毫秒后执行
      timerId = setTimeout(() => {
        fn.apply(lastThis, lastArgs);
        timerId = null;
      }, delay);
    }
  }

  /**
   * 取消当前等待中的定时器
   * 调用后，不会执行任何等待中的回调
   */
  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    lastArgs = null;
    lastThis = null;
    isInCoolingPeriod = false;
  };

  /**
   * 立即执行当前等待中的回调
   * 会取消等待中的定时器，并立即执行回调
   */
  debounced.flush = function () {
    // 如果有等待中的定时器，则立即执行并取消
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;

      // 只有存在记录的参数时才执行
      if (lastArgs !== null) {
        fn.apply(lastThis, lastArgs);
      }

      lastArgs = null;
      lastThis = null;
      isInCoolingPeriod = false;
    }
  };

  // 保留原始函数引用，便于调试
  debounced.originalFn = fn;

  return debounced;
}

export default debounce;
