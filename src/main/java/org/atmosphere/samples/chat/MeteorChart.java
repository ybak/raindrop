package org.atmosphere.samples.chat;

import org.atmosphere.config.service.MeteorService;
import org.atmosphere.cpr.AtmosphereResourceEventListenerAdapter;
import org.atmosphere.cpr.Broadcaster;
import org.atmosphere.cpr.BroadcasterFactory;
import org.atmosphere.cpr.DefaultBroadcaster;
import org.atmosphere.cpr.Meteor;
import org.atmosphere.interceptor.AtmosphereResourceLifecycleInterceptor;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Date;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import static org.atmosphere.cpr.AtmosphereResource.TRANSPORT.LONG_POLLING;

@MeteorService(path = "/*", interceptors = { AtmosphereResourceLifecycleInterceptor.class })
public class MeteorChart extends HttpServlet {

    private static final long serialVersionUID = 5373378766953029419L;

    @Override
    public void init() throws ServletException {
        super.init();
        Thread thread = new Thread() {
            public void run() {
                Broadcaster broadcaster = BroadcasterFactory.getDefault().lookup(DefaultBroadcaster.class, "/*");
                Random random = new Random();
                while (true) {
                    float nextFloat = random.nextFloat();
                    try {
                        TimeUnit.SECONDS.sleep(2);
                    } catch (InterruptedException e) {
                    }
                    broadcaster.broadcast(new Data("" + nextFloat));
                }
            };
        };
        thread.setName("data_provider_thread");
        thread.setDaemon(true);
        thread.start();
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        Meteor m = Meteor.build(req).addListener(new AtmosphereResourceEventListenerAdapter());
        m.resumeOnBroadcast(m.transport() == LONG_POLLING ? true : false).suspend(-1);
        BroadcasterFactory.getDefault().lookup(DefaultBroadcaster.class, "/*");
    }

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
    }

    private final static class Data {

        private final String text;

        public Data(String text) {
            this.text = text;
        }

        public String toString() {
            return "{ \"text\" : " + text + ", \"time\" : " + new Date().getTime() + "}";
        }
    }
}
