// import { Center, Heading, Text } from "@chakra-ui/react";
import "./Home.css"

const Home = () => {

  return (
    <div>   
        <div className="container">
            <div className="content">
                <h1 className="title">Adept AI Agent</h1>
                <h2 className="sub-title">An intelligent personal tutor, that is designed to be every student’s personal academic GURU that will transform a student’s digital learning library into a unique systematic roadmap.</h2>
                {/* <p>Adept is an AI agent that will transform a student’s digital learning library into a systematic roadmap which will be uniquely fabricated for each student</p> */}
                <a href="/inputNotes" id="get-started-btn">Get Started Now</a>
                {/* <a id="about-us-btn">About Us</a> */}
            </div>
            <img src="../../public/home-img.png" alt="Man Holding computer" />
        </div>

        <div className="about-us"> 
          <div className="card">
            <img src="../../public/abhyuday.jpg" alt="Photo of person" />
            <h3>Abhyuday Sharma</h3>
            <p>Prompt/AI Engineer</p>
            <p className="card-content">"Innovation lies in the idea, AI can do the rest"</p>
          </div>

          <div className="card">
            <img src="../../public/arya.jpg" alt="Photo of person" />
            <h3>Akshat Arya</h3>
            <p>Lead Python Engineer</p>
            <p className="card-content">"Success @ failure"</p>
          </div>

          <div className="card">
            <img src="../../public/gupta.jpg" alt="Photo of person" />
            <h3>Akshat Gupta</h3>
            <p>Lead Backend Engineer</p>
            <p className="card-content">"I am late again"</p>
          </div>

          <div className="card">
            <img src="../../public/amol.jpg" alt="Photo of person" />
            <h3>Amol Vyas</h3>
            <p>Front End Engineer</p>
            <p className="card-content">"Patience is the key to success"</p>
          </div>
        </div>
    </div>
  );
};
export default Home;