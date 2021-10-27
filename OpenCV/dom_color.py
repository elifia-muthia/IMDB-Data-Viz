import cv2
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
# from PIL import Image


def rgb_to_hex(rgb):
        return '#%02x%02x%02x' % (int(rgb[0]), int(rgb[1]), int(rgb[2]))


def find_histogram(kmeans):

    numLabels = np.arange(0, len(np.unique(kmeans.labels_)) + 1)
    (hist, _) = np.histogram(kmeans.labels_, bins=numLabels)
    hist = hist.astype("float")
    hist /= hist.sum()
    return hist


def plot_colors2(hist, centroids):
    bar = np.zeros((50, 300, 3), dtype="uint8")
    startX = 0

    for (percent, color) in zip(hist, centroids):
        # plot the relative percentage of each cluster
        endX = startX + (percent * 300)
        cv2.rectangle(bar, (int(startX), 0), (int(endX), 50),
                      color.astype("uint8").tolist(), -1)
        startX = endX

    # return the bar chart
    return bar


# im = Image.open("./OpenCV/testMovieimage.jpg")
# print(im)


# reading image
img = cv2.imread("./OpenCV/testMovieimage.jpg")
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # converting color from BGR to RGB

# reshaping to a list of pixels, represent as row*column,channel number
img = img.reshape((img.shape[0] * img.shape[1], 3))
kmeans = KMeans(n_clusters=3)  # cluster number
kmeans.fit(img)

hist = find_histogram(kmeans)
# bar = plot_colors2(hist, kmeans.cluster_centers_)

# print(hist)
# plt.axis("off")
# plt.imshow(bar)
# plt.show()

colors = kmeans.cluster_centers_.astype(int)
# print(colors)
# w, h = 2, len(colors)
# Matrix = [[0 for x in range(w)] for y in range(h)]
# for i in range(len(colors)):
#     hexColor = rgb_to_hex(colors[i])
#     print(hexColor)
#     Matrix[i][0] = hexColor
#     Matrix[i][1] = hist[i]
# print(Matrix)
