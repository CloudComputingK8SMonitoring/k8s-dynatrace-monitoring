
namespace multisnake_server
{
    /// <summary>
    /// Provides methods for generating funny names and good distinguishable colors.
    /// </summary>
    public class NamesAndColors
    {
        /// <summary>
        /// List of funny adjectives
        /// </summary>
        private static readonly string[] adjectives = {
            "Funny", "Silly", "Crazy", "Quirky", "Wacky", "Zany", "Cheeky", "Goofy", "Whimsical", "Absurd",
            "Hilarious", "Amusing", "Ludicrous", "Bizarre", "Eccentric", "Ridiculous", "Offbeat", "Playful",
            "Small", "Oddball", "Humorous", "Farcical", "Surreal", "Bonkers", "Comical", "Outlandish", "Droll",
            "Nutty", "Unconventional", "Mischievous"
        };

        /// <summary>
        /// List of funny nouns
        /// </summary>
        private static readonly string[] nouns = {
            "Banana", "Penguin", "Donkey", "Sausage", "Muffin", "Noodle", "Waffle", "Cactus", "Jellybean", "Giraffe",
            "Squid", "Pickle", "Llama", "Toaster", "Kangaroo", "Marshmallow", "Pancake", "Sardine", "Panda", "Broccoli",
            "Walrus", "Cucumber", "Zebra", "Pineapple", "Taco", "Koala", "Potato", "Popsicle", "Cupcake", "Toucan"
        };

        /// <summary>
        /// List of good distinguishable colors
        /// </summary>
        private static readonly string[] colors = {
            "#ff0000", // Red
            "#00ff00", // Green
            "#0000ff", // Blue
            "#ffff00", // Yellow
            "#ff00ff", // Magenta
            "#00ffff", // Cyan
            "#ffa500", // Orange
            "#800080", // Purple
            "#008000", // Dark Green
            "#800000", // Maroon
            "#808000", // Olive
            "#008080", // Teal
            "#000080", // Navy
            "#ffc0cb", // Pink
            "#ffd700", // Gold
            "#a52a2a", // Brown
            "#ff8c00", // Dark Orange
            "#800000", // Dark Red
            "#ff1493", // Deep Pink
            "#008000"  // Forest Green
        };

        /// <summary>
        /// Generates a random funny name.
        /// </summary>
        /// <returns>A random funny name.</returns>
        public static string generateName()
        {
            string adjective = GetRandomElement(adjectives);
            string noun = GetRandomElement(nouns);
            string funnyName = $"{adjective} {noun}";

            return funnyName;

        }

        /// <summary>
        /// Generates a random color.
        /// </summary>
        /// <returns>A random color.</returns>
        public static string generateColor()
        {
            return GetRandomElement(colors);

        }

        /// <summary>
        /// Gets a random element from the specified array.
        /// </summary>
        /// <param name="array">The array to choose from.</param>
        /// <returns>A random element from the array.</returns>
        private static string GetRandomElement(string[] array)
        {
            Random random = new Random();
            int index = random.Next(array.Length);
            return array[index];
        }
    }
}
