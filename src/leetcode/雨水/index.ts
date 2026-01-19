

export function maxArea(height) {
    let maxArea = 0;
    let left = 0, right = height.length - 1;

    while (left < right) {
        let width = right - left;
        let h = Math.min(height[left], height[right]);
        maxArea = Math.max(maxArea, width * h);

        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }

    }

    return maxArea;
}


