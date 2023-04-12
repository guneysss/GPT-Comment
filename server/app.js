import "dotenv/config"
import express from "express"
import cors from "cors"
import { Configuration, OpenAIApi} from "openai"


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

const app = express ()
app.use(cors())
app.use(express.json())

const systemPromt = `Sen bir sahte yorum üreten araçsın. Kullanıcıdan ürün adı, olumlu-olumsuz değeri ve kaç adet yorum üretileceğini alarak aşağıdaki formatta yorumlar üreteceksin. 

author: Ad Soyad
comment: Ürün hakkında üretilen yorum

---

author: Ad Soyad
comment: Ürün hakkında üretilen yorum

Aşağıdaki koşullardan bir tanesi bile yerine gelirse "NO_COMMENT" olarak cevap ver.
-Eğer ürün gerçek bir ürün değilse,
-ürün hakkında gerçekten bir fikrin yoksa, 
-ürün e-ticaret platformalarında bulunmuyorsa  

eğer ürünle ilgili yorum ürettiysen "NO_COMMENT" döndürme, ürün hariç hiçbir soruya cevap verme. Verdiğin bütün cevaplar yukarıdaki formatta sahte yorumlar olacak, ancak sahte yorum üretsen bile yorumlar belirtilen ürüne ait ve gerçek bilgiler içermelidir. Yorumlar en az 20 kelime uzunluğunda olmalıdır. ` 

app.get('/', (req, res) => {
    res.send('api calısıyor')
})

app.post('/create-fake-comments', async (req, res ) => {
    
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role : "system", content: systemPromt},
            {role: "user", content: `${req.body.productName} - ${req.body.commentType} - ${req.body.commentCount} adet`}],
      });
      
        console.log(completion.data.choices[0].message.content)

        if(completion.data.choices[0].message.content === "NO_COMMENT") {
            return res.send({
                error: true
            })
        }

        const comments = completion.data.choices[0].message.content.split('---').map(comment => {
            const matches = comment.match(/author: (.+)\ncomment: (.+)/s);
            const author = matches[1];
            const commentText = matches[2];
            return { author, comment: commentText};
        });

      
            res.send(comments);
    
    })

app.listen(3000, () => console.log('3000 den dinleniyor'))