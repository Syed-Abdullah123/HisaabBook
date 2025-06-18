import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");
const PROGRESS_BAR_WIDTH = width - 32; // 16px padding on each side
const PROGRESS_DURATION = 5000; // 3 seconds per story

type RootStackParamList = {
  Create: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Create">;

interface ProgressBarProps {
  index: number;
  isActive: boolean;
  onComplete: () => void;
  currentStory: number;
}

interface StoryContent {
  image: any;
  title: string;
  subtitle: string;
}

const stories: StoryContent[] = [
  {
    image: require("../../assets/image1.jpg"),
    title: "Digital Karo Apna Khata Or Ban Jao Buisness Ka Badshah 👑",
    subtitle: "Digital Karo Apna Khata Or Ban Jao Buisness Ka Badshah 👑",
  },
  {
    image: require("../../assets/image2.jpg"),
    title: "Apna Data Rakhien 100% Mehfooz 🛡",
    subtitle: "Keep track of your expenses and income",
  },
  {
    image: require("../../assets/image3.jpg"),
    title: "Muft Reminder Bhejein Or Payment ki Wasoli Payien 💸",
    subtitle: "Join thousands of users managing their finances",
  },
];

const ProgressBar: React.FC<ProgressBarProps> = ({
  index,
  isActive,
  onComplete,
  currentStory,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      progress.value = withTiming(1, { duration: PROGRESS_DURATION });
    } else if (index < currentStory) {
      // Keep completed bars filled
      progress.value = 1;
    } else {
      // Reset only for future bars
      progress.value = 0;
    }
  }, [isActive, index, currentStory]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
    </View>
  );
};

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStory, setCurrentStory] = React.useState(0);
  const totalStories = stories.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStory((prev) => {
        if (prev === totalStories - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, PROGRESS_DURATION);

    return () => clearInterval(timer);
  }, []);

  const currentContent = stories[currentStory];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Gradient */}
      <LinearGradient
        colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.9)", "transparent"]}
        style={styles.topGradient}
      />

      {/* Progress Bars */}
      <View style={styles.progressBarsContainer}>
        {[...Array(totalStories)].map((_, index) => (
          <ProgressBar
            key={index}
            index={index}
            isActive={index === currentStory}
            currentStory={currentStory}
            onComplete={() => {
              if (index === totalStories - 1) {
                navigation.navigate("Create");
              }
            }}
          />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <Image
          source={currentContent.image}
          style={styles.welcomeImage}
          resizeMode="cover"
        />
      </View>

      {/* Bottom Gradient with Content */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,0.9)",
        ]}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 0, y: 1 }}
        style={styles.bottomGradient}
      >
        <View style={styles.bottomContent}>
          <Text style={styles.title}>{currentContent.title}</Text>
          {/* <Text style={styles.subtitle}>{currentContent.subtitle}</Text> */}
          <TouchableOpacity
            style={[
              styles.button,
              currentStory !== totalStories - 1 && styles.buttonDisabled,
            ]}
            onPress={() => navigation.navigate("Create")}
            disabled={currentStory !== totalStories - 1}
          >
            <Text
              style={[
                styles.buttonText,
                currentStory !== totalStories - 1 && styles.buttonTextDisabled,
              ]}
            >
              Shuru Karein
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  progressBarsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 8,
    zIndex: 2,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2F51FF",
    borderRadius: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeImage: {
    width: "100%",
    height: "100%",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 60,
    paddingTop: 60,
  },
  bottomContent: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2F51FF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#2F51FF",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.7)",
  },
});
